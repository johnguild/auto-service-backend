const appRoot = require('app-root-path');
const path = require('path');
const fs = require('fs');
const MigrationDAO = require('./migration.dao');

const mainFolder = 'db_migrations';
const testFolder = '_tests';


const check = async () => {
    await MigrationDAO.createTable();
    const migration = await MigrationDAO.getLast();
    return migration ? migration : 'none';
}

const create = async (label) => {
    const name = `${new Date().getTime().toString()}_${label.toLowerCase().split(" ").join("_")}`;
    const testPath = path.join(
        appRoot.toString(), 
        testFolder,
        mainFolder, 
        `${name}.test.js`);
    const jsName = `${name}.js`;
    const filePath = path.join(
        appRoot.toString(), 
        mainFolder, 
        jsName);

    try {
        // actual migration
        await fs.promises.writeFile(filePath,
`const { getPool } = require('../db/postgres');
const pool = getPool();
const ClassName = require('../className/className.model.js');

        
const up = async() => {
    return await pool
        .query(\`CREATE TABLE \${ClassName.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            varchar_name VARCHAR, 
            date_name TIMESTAMPTZ, 
            boolean_name BOOL DEFAULT false, 
            PRIMARY KEY(id)
        );\`);
}

const down = async() => {
    return await pool
        .query(\`DROP TABLE IF EXISTS \${ClassName.tableName}; \`);
}

module.exports = {
    up,
    down
}
`);     

        await new Promise(resolve => setTimeout(() => resolve(), 100));
        // test case
        await fs.promises.writeFile(testPath, 
`const { getPool, closePool } = require('../../db/postgres');
const {up, down} = require('../../db_migrations/${name}.js');
const pool = getPool();
const ClassName = require('../../className/className.model.js');


afterAll( async () => {
    await closePool();
});

describe('up', () => {
    it('when migrating, will succeed', async() => {
        let err = null;
        try {
            await new Promise(resolve => setTimeout(() => resolve(), 100));
            await up();
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();
        
        // do some assertion
        const res = await pool.query(\`SELECT to_regclass('\${ClassName.tableName}');\`);
        expect(res.rows[0].to_regclass).toBe(ClassName.tableName);
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
        const res = await pool.query(\`SELECT to_regclass('\${ClassName.tableName}');\`);
        expect(res.rows[0].to_regclass).toBeNull();
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