-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "avatar" TEXT,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "redirect" TEXT NOT NULL
);
INSERT INTO "new_Client" ("avatar", "clientId", "clientSecret", "desc", "id", "name", "redirect") SELECT "avatar", "clientId", "clientSecret", "desc", "id", "name", "redirect" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_clientId_key" ON "Client"("clientId");
CREATE INDEX "Client_name_clientId_idx" ON "Client"("name", "clientId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
