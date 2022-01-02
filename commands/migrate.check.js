const MigrationDAO = require('../migration/migration.dao');
const argv = process.argv.splice(2);


const run = async () => {
    await MigrationDAO.createTable();
    const migration = await MigrationDAO.getLast();

    return migration ? migration : 'none';
}

run()
.then((migration) => console.log(`Latest migration ${migration}`))
.catch((e) => console.log(e.toString()))
.finally(() => process.exit());
