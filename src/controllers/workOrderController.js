const { WorkOrder, Installation, User, Attachment, FilterHousing, FilterModel, Location, FilterInstance } = require('../models');
const { getAccessibleLocationIds } = require('../utils/locationAccess');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('../models');
const { generateWorkOrder } = require('../services/documentGenerator');
const ApiError = require('../utils/ApiError');

// GET /api/work-orders
exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.startDate && req.query.endDate) {
    where.workDate = { [Op.between]: [req.query.startDate, req.query.endDate] };
  }
  if (req.query.status) where.status = req.query.status;

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null) {
    if (accessibleIds.length === 0) return res.json({ total: 0, data: [] });
    const { count, rows } = await WorkOrder.findAndCountAll({
      where,
      include: [
        {
          model: Installation,
          as: 'newInstallation',
          required: true,
          include: [{
            model: FilterHousing,
            as: 'housing',
            where: { locationId: { [Op.in]: accessibleIds } },
            required: true
          }]
        },
        { model: User, as: 'performer', attributes: ['id', 'fullName'] },
        { model: User, as: 'approver', attributes: ['id', 'fullName'] }
      ],
      order: [['workDate', 'DESC']],
      limit,
      offset,
      distinct: true
    });
    return res.json({ total: count, page, limit, data: rows });
  }

  const { count, rows } = await WorkOrder.findAndCountAll({
    where,
    include: [
      { model: Installation, as: 'newInstallation' },
      { model: User, as: 'performer', attributes: ['id', 'fullName'] },
      { model: User, as: 'approver', attributes: ['id', 'fullName'] }
    ],
    order: [['workDate', 'DESC']],
    limit,
    offset
  });
  res.json({ total: count, page, limit, data: rows });
};

// GET /api/work-orders/:id
exports.getOne = async (req, res) => {
  const { id } = req.params;
  const workOrder = await WorkOrder.findByPk(id, {
    include: [
      { model: Installation, as: 'oldInstallation' },
      {
        model: Installation,
        as: 'newInstallation',
        include: [{ model: FilterHousing, as: 'housing' }]
      },
      { model: User, as: 'performer', attributes: ['id', 'fullName'] },
      { model: User, as: 'approver', attributes: ['id', 'fullName'] },
      { model: Attachment, as: 'attachments' }
    ]
  });
  if (!workOrder) {
    throw new ApiError(404, 'Акт не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null) {
    const locationId = workOrder.newInstallation?.housing?.locationId;
    if (locationId && !accessibleIds.includes(locationId)) {
      throw new ApiError(403, 'Нет доступа к данному акту');
    }
  }

  res.json(workOrder);
};

// POST /api/work-orders
exports.create = async (req, res) => {
  const newWorkOrder = await WorkOrder.create({
    ...req.body,
    performedBy: req.body.performedBy || req.user.id
  });
  res.status(201).json(newWorkOrder);
};

// PUT /api/work-orders/:id
exports.update = async (req, res) => {
  const { id } = req.params;
  const workOrder = await WorkOrder.findByPk(id);
  if (!workOrder) {
    throw new ApiError(404, 'Акт не найден');
  }
  await workOrder.update(req.body);
  res.json(workOrder);
};

// DELETE /api/work-orders/:id
exports.delete = async (req, res) => {
  const { id } = req.params;
  const workOrder = await WorkOrder.findByPk(id);
  if (!workOrder) {
    throw new ApiError(404, 'Акт не найден');
  }
  await workOrder.destroy();
  res.status(204).send();
};

// GET /api/work-orders/:id/pdf
exports.getPdf = async (req, res) => {
  const { id } = req.params;
  const workOrder = await WorkOrder.findByPk(id, {
    include: [{
      model: Installation,
      as: 'newInstallation',
      include: [{ model: FilterHousing, as: 'housing' }]
    }]
  });
  if (!workOrder) {
    throw new ApiError(404, 'Акт не найден');
  }
  if (!workOrder.pdfPath) {
    throw new ApiError(404, 'PDF не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null) {
    const locationId = workOrder.newInstallation?.housing?.locationId;
    if (locationId && !accessibleIds.includes(locationId)) {
      throw new ApiError(403, 'Нет доступа к данному акту');
    }
  }

  const filePath = path.join(__dirname, '../../', workOrder.pdfPath);
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, 'Файл отсутствует');
  }
  res.sendFile(filePath);
};

// POST /api/work-orders/:id/attachments
exports.uploadAttachments = async (req, res) => {
  const { id } = req.params;
  const workOrder = await WorkOrder.findByPk(id, {
    include: [{
      model: Installation,
      as: 'newInstallation',
      include: [{ model: FilterHousing, as: 'housing' }]
    }]
  });
  if (!workOrder) {
    throw new ApiError(404, 'Акт не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null) {
    const locationId = workOrder.newInstallation?.housing?.locationId;
    if (locationId && !accessibleIds.includes(locationId)) {
      throw new ApiError(403, 'Нет доступа к данному акту');
    }
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'Нет файлов');
  }

  const attachments = [];
  for (const file of req.files) {
    const attachment = await Attachment.create({
      workOrderId: id,
      fileName: path.basename(file.path),
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size
    });
    attachments.push(attachment);
  }
  res.status(201).json(attachments);
};

// GET /api/work-orders/:id/attachments/:fileId
exports.downloadAttachment = async (req, res) => {
  const { id, fileId } = req.params;
  const attachment = await Attachment.findOne({
    where: { id: fileId, workOrderId: id },
    include: [{
      model: WorkOrder,
      as: 'workOrder',
      include: [{
        model: Installation,
        as: 'newInstallation',
        include: [{ model: FilterHousing, as: 'housing' }]
      }]
    }]
  });
  if (!attachment) {
    throw new ApiError(404, 'Файл не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null) {
    const locationId = attachment.workOrder?.newInstallation?.housing?.locationId;
    if (locationId && !accessibleIds.includes(locationId)) {
      throw new ApiError(403, 'Нет доступа к данному файлу');
    }
  }

  const filePath = path.join(__dirname, '../../', attachment.filePath);
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, 'Файл отсутствует');
  }
  res.download(filePath, attachment.fileName);
};

// POST /api/work-orders/:id/generate-pdf
exports.generatePdf = async (req, res) => {
  const { id } = req.params;

  const workOrder = await WorkOrder.findByPk(id, {
    include: [
      {
        model: Installation,
        as: 'oldInstallation',
        include: [
          {
            model: FilterInstance,
            as: 'filterInstance',
            include: [{ model: FilterModel, as: 'model' }]
          }
        ]
      },
      {
        model: Installation,
        as: 'newInstallation',
        include: [
          {
            model: FilterInstance,
            as: 'filterInstance',
            include: [{ model: FilterModel, as: 'model' }]
          },
          {
            model: FilterHousing,
            as: 'housing',
            include: [{ model: Location, as: 'location' }]
          }
        ]
      },
      { model: User, as: 'performer' }
    ]
  });

  if (!workOrder) {
    throw new ApiError(404, 'Акт не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  const locationId = workOrder.newInstallation?.housing?.locationId;
  if (accessibleIds !== null && locationId && !accessibleIds.includes(locationId)) {
    throw new ApiError(403, 'Нет доступа');
  }

  const pdfData = {
    workOrderNumber: workOrder.id,
    workDate: workOrder.workDate,
    equipment: workOrder.newInstallation?.housing
      ? `${workOrder.newInstallation.housing.name} (${workOrder.newInstallation.housing.location?.name || '—'})`
      : '—',
    oldFilter: workOrder.oldInstallation?.filterInstance
      ? `${workOrder.oldInstallation.filterInstance.model?.name || '?'} (${workOrder.oldInstallation.filterInstance.serialNumber || '—'})`
      : '—',
    newFilter: workOrder.newInstallation?.filterInstance
      ? `${workOrder.newInstallation.filterInstance.model?.name || '?'} (${workOrder.newInstallation.filterInstance.serialNumber || '—'})`
      : '—',
    performer: workOrder.performer?.fullName || 'Неизвестно',
    master: '',
    notes: workOrder.notes || ''
  };

  try {
    const pdfBuffer = await generateWorkOrder(pdfData);
    const fileName = `work-order-${workOrder.id}.pdf`;
    const uploadDir = path.join(__dirname, '../../uploads/work-orders');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, fileName);

    // Проверяем существование файла и записываем, если нужно
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
      fs.writeFileSync(filePath, pdfBuffer);
    } else {
      // При желании перезапись
      console.log(`Файл ${fileName} уже существует, перезаписываем.`);
      fs.writeFileSync(filePath, pdfBuffer);
    }

    const relativePath = `uploads/work-orders/${fileName}`;
    if (workOrder.pdfPath !== relativePath) {
      workOrder.pdfPath = relativePath;
      await workOrder.save();
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (err) {
    throw new ApiError(500, 'Ошибка генерации PDF', false, err.stack);
  }
};