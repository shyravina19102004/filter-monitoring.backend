const { Notification, Installation, Rule } = require('../models');
const ApiError = require('../utils/ApiError');

exports.getMyNotifications = async (req, res) => {
  const where = { userId: req.user.id };
  if (req.query.isRead !== undefined) {
    where.isRead = req.query.isRead === 'true';
  }
  const notifications = await Notification.findAll({
    where,
    include: [
      { model: Installation, as: 'installation' },
      { model: Rule, as: 'rule' }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json(notifications);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOne({
    where: { id, userId: req.user.id },
    include: [
      { model: Installation, as: 'installation' },
      { model: Rule, as: 'rule' }
    ]
  });
  if (!notification) {
    throw new ApiError(404, 'Оповещение не найдено');
  }
  res.json(notification);
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOne({
    where: { id, userId: req.user.id }
  });
  if (!notification) {
    throw new ApiError(404, 'Оповещение не найдено');
  }
  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();
  res.json(notification);
};

exports.markAllAsRead = async (req, res) => {
  await Notification.update(
    { isRead: true, readAt: new Date() },
    { where: { userId: req.user.id, isRead: false } }
  );
  res.json({ message: 'Все оповещения отмечены прочитанными' });
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOne({
    where: { id, userId: req.user.id }
  });
  if (!notification) {
    throw new ApiError(404, 'Оповещение не найдено');
  }
  await notification.destroy();
  res.status(204).send();
};