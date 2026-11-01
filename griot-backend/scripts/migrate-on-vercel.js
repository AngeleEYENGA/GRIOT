const { spawnSync } = require('node:child_process');

if (process.env.VERCEL !== '1') {
  process.exit(0);
}

const prismaCli = require.resolve('prisma/build/index.js');
const result = spawnSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
  stdio: 'inherit',
});

if (result.error) {
  console.error('Unable to run Prisma production migrations.', result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
