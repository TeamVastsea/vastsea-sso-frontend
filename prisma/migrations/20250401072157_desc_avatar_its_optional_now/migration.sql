-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nick" TEXT NOT NULL,
    "desc" TEXT,
    "avatar" TEXT,
    "accountid" BIGINT NOT NULL,
    CONSTRAINT "Profile_accountid_fkey" FOREIGN KEY ("accountid") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("accountid", "avatar", "desc", "id", "nick") SELECT "accountid", "avatar", "desc", "id", "nick" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_accountid_key" ON "Profile"("accountid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
