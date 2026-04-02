const { FilterInstance, FilterModel, Installation, FilterHousing, Location } = require('../models');
const { generateLabel } = require('../services/documentGenerator');
const { getAccessibleLocationIds } = require('../utils/locationAccess');
const ApiError = require('../utils/ApiError');

// GET /api/filter-instances
exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.filterModelId) where.filterModelId = req.query.filterModelId;
  if (req.query.status) where.status = req.query.status;

  const { count, rows } = await FilterInstance.findAndCountAll({
    where,
    include: [{ model: FilterModel, as: 'model' }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  res.json({ total: count, page, limit, data: rows });
};

// GET /api/filter-instances/:id
exports.getOne = async (req, res) => {
  const { id } = req.params;
  const instance = await FilterInstance.findByPk(id, {
    include: [{ model: FilterModel, as: 'model' }]
  });
  if (!instance) {
    throw new ApiError(404, 'Экземпляр не найден');
  }
  res.json(instance);
};

// POST /api/filter-instances
exports.create = async (req, res) => {
  const newInstance = await FilterInstance.create(req.body);
  res.status(201).json(newInstance);
};

// PUT /api/filter-instances/:id
exports.update = async (req, res) => {
  const { id } = req.params;
  const instance = await FilterInstance.findByPk(id);
  if (!instance) {
    throw new ApiError(404, 'Экземпляр не найден');
  }
  await instance.update(req.body);
  res.json(instance);
};

// DELETE /api/filter-instances/:id
exports.delete = async (req, res) => {
  const { id } = req.params;
  const instance = await FilterInstance.findByPk(id);
  if (!instance) {
    throw new ApiError(404, 'Экземпляр не найден');
  }

  if (instance.status === 'installed') {
    throw new ApiError(400, 'Нельзя удалить установленный фильтр');
  }

  await instance.destroy();
  res.status(204).send();
};

// PATCH /api/filter-instances/:id/write-off
exports.writeOff = async (req, res) => {
  const { id } = req.params;
  const instance = await FilterInstance.findByPk(id);
  if (!instance) {
    throw new ApiError(404, 'Экземпляр не найден');
  }

  if (instance.status === 'written_off') {
    throw new ApiError(400, 'Фильтр уже списан');
  }

  instance.status = 'written_off';
  await instance.save();
  res.json(instance);
};

// GET /api/filter-instances/:id/label
exports.generateLabel = async (req, res) => {
  const { id } = req.params;

  const installation = await Installation.findOne({
    where: { filterInstanceId: id, isActive: true },
    include: [
      { model: FilterHousing, as: 'housing', include: [{ model: Location, as: 'location' }] },
      {
        model: FilterInstance,
        as: 'filterInstance',
        include: [{
          model: FilterModel,
          as: 'model',
          include: ['type']
        }]
      }
    ]
  });

  if (!installation) {
    throw new ApiError(404, 'Активная установка с этим фильтром не найдена');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(installation.housing.locationId)) {
    throw new ApiError(403, 'Нет доступа');
  }

  const filterModel = installation.filterInstance.model;
  const filterType = filterModel.type;

  const buildLocationPath = async (locationId) => {
    const locations = [];
    let currentId = locationId;
    while (currentId) {
      const loc = await Location.findByPk(currentId, { attributes: ['id', 'name', 'parentId'] });
      if (!loc) break;
      locations.unshift(loc.name);
      currentId = loc.parentId;
    }
    return locations.join(' → ');
  };

  const locationPath = await buildLocationPath(installation.housing.locationId);

  // Генерируем QR-код (например, ссылка на детальную страницу фильтра)
  const qrData = `${process.env.BASE_URL || 'http://localhost:5000'}/filters/${id}`;
  const qrBuffer = await QRCode.toBuffer(qrData, { width: 200 });

  const data = {
    filterModel: filterModel.name,
    filterType: filterType ? filterType.name : '',
    serialNumber: installation.filterInstance.serialNumber || '—',
    installationDate: installation.installationDate,
    initialMeter: installation.meterReadingAtInstall || 0,
    locationPath,
    qrBuffer   // передаём буфер QR-кода
  };

  try {
    const pdfBuffer = await generateLabel(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="label-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    throw new ApiError(500, 'Ошибка генерации этикетки', false, err.stack);
  }
};