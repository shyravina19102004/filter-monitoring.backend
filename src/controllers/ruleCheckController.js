const rulesEngine = require('../services/rulesEngineService');
const ApiError = require('../utils/ApiError');

exports.manualCheck = async (req, res) => {
  try {
    await rulesEngine.checkAllInstallations();
    res.json({ message: 'Проверка правил запущена и завершена успешно' });
  } catch (error) {
    throw new ApiError(500, error.message, false, error.stack);
  }
};