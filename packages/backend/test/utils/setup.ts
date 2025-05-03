import { Prisma, PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromisify = promisify(exec);
const prisma = new PrismaClient();

const tables = Prisma.dmmf.datamodel.models
  .map((model) => model.dbName)
  .filter((table) => table);

const clearMysql = async () => {
  await prisma.$transaction([
    prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`,
    ...tables.map((table) => prisma.$executeRawUnsafe(`TRUNCATE ${table};`)),
    prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`,
  ]);
};

const clearPostgres = async () => {
  await prisma.$transaction([
    ...tables.map((table) =>
      prisma.$executeRawUnsafe(`TRUNCATE ${table} CASCADE;`),
    ),
  ]);
};

const clearDefault = async () => {};
execPromisify(
  `pnpm prisma migrate reset --force --skip-seed --schema=prisma/schema.dev.prisma`,
);

export const clear = async (provider: string) => {
  const executeClear = {
    mysql: clearMysql,
    postgres: clearPostgres,
  };

  const execute = executeClear[provider] || clearDefault;
  return execute();
};
