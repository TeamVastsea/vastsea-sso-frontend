/*
  Warnings:

  - Added the required column `clientPK` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Made the column `clientId` on table `Role` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Role" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL DEFAULT '',
    "clientId" TEXT NOT NULL,
    "clientPK" BIGINT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Role_clientPK_fkey" FOREIGN KEY ("clientPK") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Role" ("active", "clientId", "desc", "id", "name") SELECT "active", "clientId", "desc", "id", "name" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
CREATE INDEX "Role_id_desc_clientId_active_idx" ON "Role"("id", "desc", "clientId", "active");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
