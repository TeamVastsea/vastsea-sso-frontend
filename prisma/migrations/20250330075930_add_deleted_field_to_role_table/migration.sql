-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Role" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "clientId" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Role" ("clientId", "desc", "id", "name") SELECT "clientId", "desc", "id", "name" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
CREATE INDEX "Role_id_desc_clientId_deleted_idx" ON "Role"("id", "desc", "clientId", "deleted");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
