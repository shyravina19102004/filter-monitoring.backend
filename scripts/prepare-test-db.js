const { execSync } = require('child_process');

const env = {
  ...process.env,
  NODE_ENV: 'test',
  DOTENV_CONFIG_PATH: '.env.test',
};

console.log('=== Preparing test database ===');

console.log('1. Dropping test database (if exists)...');
try {
  execSync('npx sequelize-cli db:drop --config src/config/database.js', { env, stdio: 'inherit' });
} catch (error) {
  console.log('Database does not exist, skipping drop.');
}

console.log('2. Creating test database...');
execSync('npx sequelize-cli db:create --config src/config/database.js', { env, stdio: 'inherit' });

console.log('3. Running migrations...');
execSync('npx sequelize-cli db:migrate --config src/config/database.js', { env, stdio: 'inherit' });

console.log('4. Running seeds...');
execSync('npx sequelize-cli db:seed:all --config src/config/database.js', { env, stdio: 'inherit' });

console.log('Test database is ready.');