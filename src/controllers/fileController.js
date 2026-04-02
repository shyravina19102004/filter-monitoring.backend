const path = require('path');
const fs = require('fs');
const { Attachment, WorkOrder, Installation, FilterHousing } = require('../models');
const { getAccessibleLocationIds } = require('../utils/locationAccess');
const ApiError = require('../utils/ApiError');

exports.getFile = async (req, res) => {
  const { type, filename } = req.params;

  if (type === 'work-order-attachments') {
    const attachment = await Attachment.findOne({ where: { fileName: filename } });
    if (!attachment) {
      throw new ApiError(404, 'Файл не найден');
    }

    const workOrder = await WorkOrder.findByPk(attachment.workOrderId, {
      include: [
        {
          model: Installation,
          as: 'newInstallation',
          include: [{ model: FilterHousing, as: 'housing' }]
        }
      ]
    });

    if (workOrder) {
      const accessibleIds = await getAccessibleLocationIds(req.user);
      const locationId = workOrder.newInstallation?.housing?.locationId;
      if (accessibleIds !== null && locationId && !accessibleIds.includes(locationId)) {
        throw new ApiError(403, 'Нет доступа к данному файлу');
      }
    }

    const fullPath = attachment.filePath;
    if (!fs.existsSync(fullPath)) {
      throw new ApiError(404, 'Файл отсутствует');
    }

    res.download(fullPath, attachment.fileName);
  } else {
    throw new ApiError(400, 'Неизвестный тип файла');
  }
};