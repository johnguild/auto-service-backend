const appRoot = require('app-root-path');
const fs = require('fs');
const path = require('path');
const { getPool } = require('../db/postgres');
const MigrationDAO = require('../migration/migration.dao');
const argv = process.argv.splice(2);


const run = async() => {
    await MigrationDAO.createTable();
    const migrations = await MigrationDAO.getAll();


    const localDir = path.join(appRoot.toString(), 'db_migrations');
    const migrationFiles = await fs.promises.readdir(localDir);

    let migrated = 0;
    for (const file of migrationFiles) {
        if (!file.includes('.js')) continue;
        if (migrations.includes(file)) continue;

        // run code
        const {up} = require(path.join(localDir, file));
        try {
            await up();

            // insert to table
            await MigrationDAO.insert(file);

            migrated++;
        } catch (error) {
            console.log(error);
            break;
        }
    }

    return migrated;
}

run()
.then((total) => console.log(`Success! ${total} migrated files`))
.catch((e) => console.log(e))
.finally(() => process.exit());
