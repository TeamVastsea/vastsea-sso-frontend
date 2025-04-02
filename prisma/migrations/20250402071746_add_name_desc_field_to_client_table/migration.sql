/*
  Warnings:

  - Added the required column `avatar` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desc` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "redirect" TEXT NOT NULL
);
INSERT INTO "new_Client" ("clientId", "clientSecret", "id", "name", "redirect") SELECT "clientId", "clientSecret", "id", "name", "redirect" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE INDEX "Client_name_clientId_idx" ON "Client"("name", "clientId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
