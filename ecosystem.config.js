module.exports = {
  apps: [{
    name: 'filter-monitoring',
    script: 'server.js',
    instances: 1,               // для одного ядра; можно 'max' для кластеризации
    exec_mode: 'fork',          // или 'cluster'
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    watch: false,               // отключаем watch в production
    max_memory_restart: '512M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    merge_logs: true,
    time: true
  }]
};