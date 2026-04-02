const { Installation, FilterHousing, FilterInstance, Meter, User, WorkOrder, Location, FilterModel } = require('../models');
const { getAccessibleLocationIds } = require('../utils/locationAccess');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const path = require('path');
const fs = require('fs');
const { generateWorkOrder } = require('../services/documentGenerator');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

// GET /api/installations
exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.housingId) where.housingId = req.query.housingId;
  if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null) {
    if (accessibleIds.length === 0) return res.json({ total: 0, data: [] });
    const { count, rows } = await Installation.findAndCountAll({
      where,
      include: [
        {
          model: FilterHousing,
          as: 'housing',
          required: true,
          where: { locationId: { [Op.in]: accessibleIds } }
        },
        { model: FilterInstance, as: 'filterInstance' },
        { model: Meter, as: 'meter' },
        { model: User, as: 'installer', attributes: ['id', 'fullName'] }
      ],
      order: [['installationDate', 'DESC']],
      limit,
      offset,
      distinct: true
    });
    return res.json({ total: count, page, limit, data: rows });
  }

  const { count, rows } = await Installation.findAndCountAll({
    where,
    include: [
      { model: FilterHousing, as: 'housing' },
      { model: FilterInstance, as: 'filterInstance' },
      { model: Meter, as: 'meter' },
      { model: User, as: 'installer', attributes: ['id', 'fullName'] }
    ],
    order: [['installationDate', 'DESC']],
    limit,
    offset,
    distinct: true
  });
  res.json({ total: count, page, limit, data: rows });
};

// GET /api/installations/:id
exports.getOne = async (req, res) => {
  const { id } = req.params;
  const installation = await Installation.findByPk(id, {
    include: [
      { model: FilterHousing, as: 'housing' },
      { model: FilterInstance, as: 'filterInstance' },
      { model: Meter, as: 'meter' },
      { model: User, as: 'installer', attributes: ['id', 'fullName'] }
    ]
  });
  if (!installation) {
    throw new ApiError(404, 'Установка не найдена');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null) {
    const housing = await FilterHousing.findByPk(installation.housingId);
    if (housing && !accessibleIds.includes(housing.locationId)) {
      throw new ApiError(403, 'Нет доступа');
    }
  }
  res.json(installation);
};

// GET /api/installations/history/:housingId
exports.getHistoryByHousing = async (req, res) => {
  const { housingId } = req.params;

  const housing = await FilterHousing.findByPk(housingId);
  if (!housing) {
    throw new ApiError(404, 'Корпус не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(housing.locationId)) {
    throw new ApiError(403, 'Нет доступа');
  }

  const installations = await Installation.findAll({
    where: { housingId },
    include: [
      { model: FilterInstance, as: 'filterInstance' },
      { model: Meter, as: 'meter' },
      { model: User, as: 'installer', attributes: ['id', 'fullName'] }
    ],
    order: [['installationDate', 'DESC']]
  });
  res.json(installations);
};

// POST /api/installations
exports.create = async (req, res) => {
  const { housingId, filterInstanceId, installationDate, meterId, meterReadingAtInstall, notes } = req.body;
  const transaction = await sequelize.transaction();

  try {
    // Валидация даты установки
    const installationDateObj = new Date(installationDate);
    if (isNaN(installationDateObj.getTime())) {
      throw new ApiError(400, 'Неверный формат даты установки');
    }
    if (installationDateObj > new Date()) {
      throw new ApiError(400, 'Дата установки не может быть в будущем');
    }

    const accessibleIds = await getAccessibleLocationIds(req.user);
const housing = await FilterHousing.findByPk(housingId, { transaction });
if (!housing) {
  throw new ApiError(404, 'Корпус не найден');
}
if (accessibleIds !== null && !accessibleIds.includes(housing.locationId)) {
  throw new ApiError(403, 'Нет доступа к корпусу');
}

    const filterInstance = await FilterInstance.findByPk(filterInstanceId, { transaction });
    if (!filterInstance) {
      throw new ApiError(404, 'Экземпляр фильтра не найден');
    }
    if (filterInstance.status !== 'in_stock') {
      throw new ApiError(400, 'Фильтр не на складе');
    }

    const oldInstallation = await Installation.findOne({
      where: { housingId, isActive: true },
      transaction
    });

    if (oldInstallation) {
      await oldInstallation.update({ isActive: false }, { transaction });

      const oldFilterInstance = await FilterInstance.findByPk(oldInstallation.filterInstanceId, { transaction });
      if (oldFilterInstance) {
        oldFilterInstance.status = 'written_off';
        await oldFilterInstance.save({ transaction });
      }
    }

    const newInstallation = await Installation.create({
      housingId,
      filterInstanceId,
      installationDate,
      meterId,
      meterReadingAtInstall,
      installedBy: req.user.id,
      notes,
      isActive: true
    }, { transaction });

    filterInstance.status = 'installed';
    filterInstance.installationDate = installationDate;
    await filterInstance.save({ transaction });

    const workOrderData = {
      workDate: installationDate || new Date(),
      oldInstallationId: oldInstallation ? oldInstallation.id : null,
      newInstallationId: newInstallation.id,
      workType: 'replacement',
      performedBy: req.user.id,
      notes: notes || 'Автоматически создан при замене фильтра',
      status: 'draft',
      pdfPath: null
    };

    const workOrder = await WorkOrder.create(workOrderData, { transaction });

    // Генерация PDF
    try {
      const performer = await User.findByPk(req.user.id, { attributes: ['fullName'], transaction });
      const housingWithLocation = await FilterHousing.findByPk(housingId, {
        include: [{ model: Location, as: 'location' }],
        transaction
      });
      const oldFilterInstanceData = oldInstallation
        ? await FilterInstance.findByPk(oldInstallation.filterInstanceId, {
            include: [{ model: FilterModel, as: 'model' }],
            transaction
          })
        : null;
      const newFilterInstanceData = await FilterInstance.findByPk(filterInstanceId, {
        include: [{ model: FilterModel, as: 'model' }],
        transaction
      });

      const pdfData = {
        workOrderNumber: workOrder.id,
        workDate: installationDate || new Date(),
        equipment: `${housingWithLocation.name} (${housingWithLocation.location?.name || '—'})`,
        oldFilter: oldFilterInstanceData
          ? `${oldFilterInstanceData.model?.name || '?'} (${oldFilterInstanceData.serialNumber || '—'})`
          : '—',
        newFilter: `${newFilterInstanceData.model?.name || '?'} (${newFilterInstanceData.serialNumber || '—'})`,
        performer: performer ? performer.fullName : 'Неизвестно',
        master: '',
        notes: notes || ''
      };

      const pdfBuffer = await generateWorkOrder(pdfData);
      const fileName = `work-order-${workOrder.id}.pdf`;
      const uploadDir = path.join(__dirname, '../../uploads/work-orders');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, pdfBuffer);

      workOrder.pdfPath = `uploads/work-orders/${fileName}`;
      await workOrder.save({ transaction });
    } catch (pdfErr) {
      // Логируем ошибку, но не прерываем транзакцию
      logger.error(`Ошибка генерации PDF для workOrder ${workOrder.id}: ${pdfErr.message}`);
    }

    await transaction.commit();
    res.status(201).json(newInstallation);
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message, false, error.stack);
  }
};

// DELETE /api/installations/:id
exports.delete = async (req, res) => {
  const { id } = req.params;
  const installation = await Installation.findByPk(id, {
    include: [{ model: FilterHousing, as: 'housing' }]
  });
  if (!installation) {
    throw new ApiError(404, 'Установка не найдена');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(installation.housing.locationId)) {
    throw new ApiError(403, 'Нет доступа');
  }

  if (installation.isActive) {
    throw new ApiError(400, 'Нельзя удалить активную установку');
  }

  await installation.destroy();
  res.status(204).send();
};