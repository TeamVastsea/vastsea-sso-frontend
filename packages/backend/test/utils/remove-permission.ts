import { PrismaClient } from '@prisma/client';

export const removePermission = async (email: string) => {
  const prisma = new PrismaClient();
  const account = await prisma.account.findFirst({
    where: { email },
  });
  await prisma.account.update({
    where: {
      id: account.id,
    },
    data: {
      role: {
        set: [],
      },
    },
  });
};
