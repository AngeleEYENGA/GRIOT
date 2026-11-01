const { spawnSync } = require('node:child_process');

if (process.env.VERCEL !== '1') {
  process.exit(0);
}

const prismaCli = require.resolve('prisma/build/index.js');
for (const [command, ...options] of [['generate'], ['migrate', 'deploy']]) {
  const args = [prismaCli, command, ...options];
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });

  if (result.error) {
    console.error(`Unable to run Prisma ${command}.`, result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
