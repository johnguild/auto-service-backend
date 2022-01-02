const appRoot = require('app-root-path');
const path = require('path');
const migrationDAO = require('../migration/migration.dao');
const argv = process.argv.splice(2);


const run = async() => {
    await migrationDAO.createTable();
    const localDir = path.join(appRoot.toString(), 'db_migrations');

    let fileName = 'Nothing';
    const latestMigration = await migrationDAO.getLast();

    if (latestMigration) {
        fileName = latestMigration;

        const {down} = require(path.join(localDir, fileName));

        try {
            await down();

            // insert to table
            await migrationDAO.remove(fileName);

        } catch (error) {
            console.log(error);
        }
    }

    return fileName;
}


run()
.then((fileName) => console.log(`Success! ${fileName} rolled back`))
.catch((e) => console.log(e))
.finally(() => process.exit());
