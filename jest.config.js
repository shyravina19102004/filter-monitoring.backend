module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/index.js',
    '!src/config/**',
    '!src/migrations/**',
    '!src/seeders/**'
  ],
  coverageThreshold: {
    global: {
      lines: 70
    }
  }
};