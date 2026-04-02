module.exports = (requiredPermission) => {
  return (req, res, next) => {
    // Предполагаем, что authenticate уже выполнен и req.user существует
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    // Извлекаем массив имён разрешений пользователя
    const userPermissions = req.user.role?.permissions?.map(p => p.name) || [];

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    next();
  };
};