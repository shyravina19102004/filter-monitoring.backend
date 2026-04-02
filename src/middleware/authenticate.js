const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

module.exports = async (req, res, next) => {
  try {
    // 1. Получаем заголовок Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Ищем пользователя в БД вместе с ролью и разрешениями
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] } // не включаем поля связи
            }
          ]
        }
      ],
      attributes: { exclude: ['passwordHash'] } // не возвращаем пароль
    });

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Учётная запись заблокирована' });
    }

    // 4. Добавляем пользователя в запрос
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Невалидный токен' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен истёк' });
    }
    next(error); // передаём дальше в обработчик ошибок
  }
};