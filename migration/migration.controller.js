const appRoot = require('app-root-path');
const path = require('path');
const fs = require('fs');
const MigrationDAO = require('./migration.dao');

const mainFolder = 'db_migrations';
const testFolder = 'tests';


const check = async () => {
    await MigrationDAO.createTable();
    const migration = await MigrationDAO.getLast();
    return migration ? migration : 'none';
}

const create = async (label) => {
    const name = `${new Date().getTime().toString()}_${label.toLowerCase().split(" ").join("_")}`;
    const testPath = path.join(
        appRoot.toString(), 
        mainFolder, 
        testFolder, 
        `${name}.test.js`);
    const jsName = `${name}.js`;
    const filePath = path.join(
        appRoot.toString(), 
        mainFolder, 
        jsName);

    try {
        // actual migration
        await fs.promises.writeFile(filePath,
`const { mkReq } = require('../db/mssql');

        
const up = async() => {
    const request = await mkReq();
    return await request
        .query(\`CREATE TABLE table_name (
            id INT PRIMARY KEY IDENTITY (1, 1),
            PRIMARY KEY(id)
        );\`);
}

const down = async() => {
    const request = await mkReq();
    return await request
        .query(\`DROP TABLE IF EXISTS table_name; \`);
}

module.exports = {
    up,
    down
}
`);     
        // test case
        await fs.promises.writeFile(testPath, 
`const { mkReq, closePool } = require('../../db/mssql');
const {up, down} = require('../${name}.js');


afterAll( async () => {
    await closePool();
});

describe('up', () => {
    it('when migrating, will succeed', async() => {
        let err = null;
        try {
            await up();
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();
        // do some assertion
    });
});


describe('down', () => {
    it('when rollback, will succeed', async() => {
        let err = null;
        try {
            await down();
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();
        // do some assertion
    });
});

`);
    } catch (error) {
        throw new Error(error);
    }


    return jsName;

}

const migrate = async () => {
    await MigrationDAO.createTable();
    const migrations = await MigrationDAO.getAll();

    const localDir = path.join(appRoot.toString(), mainFolder);
    const migrationFiles = await fs.promises.readdir(localDir);

    // console.log(migrationFiles.toString());
    // console.log(localDir.toString());

    let migrated = 0;
    for (const file of migrationFiles) {
        if (!file.includes('.js')) continue;
        if (migrations.includes(file)) continue;

        // console.log(file);

        /// simple path.join(localDir, file) does not work on
        /// Azure's App service
        const {up} = require(path.join('..', mainFolder, file));
        try {
            await up();

            // insert to table
            await MigrationDAO.insert(file.toString());

            migrated++;
        } catch (error) {
            console.log(error);
            break;
        }
    }

    return migrated;
}

const rollback = async () => {
    await MigrationDAO.createTable();
    const localDir = path.join(appRoot.toString(), mainFolder);

    let fileName = 'Nothing';
    const latestMigration = await MigrationDAO.getLast();

    if (latestMigration) {
        fileName = latestMigration;

        /// simple path.join(localDir, file) does not work on
        /// Azure's App service
        const {down} = require(path.join('..', mainFolder, fileName));

        try {
            await down();

            // insert to table
            await MigrationDAO.remove(fileName);

        } catch (error) {
            console.log(error);
        }
    }

    return fileName;
}




module.exports = {
    check,
    create,
    migrate,
    rollback
}