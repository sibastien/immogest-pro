// pm2 process config for the ImmoGest Pro backend.
// Usage on the VPS:  pm2 start ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [
    {
      name: 'immogest-api',
      script: 'src/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
