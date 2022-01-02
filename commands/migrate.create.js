const appRoot = require('app-root-path');
const path = require('path');
const fs = require('fs');
const argv = process.argv.splice(2);

if (argv.length != 1) {
    console.log('missing arguments, try npm run create:migration create_users_table');
    return process.exit();
}


const createMigration = async (label) => {
    const name = `${new Date().getTime().toString()}_${label.toLowerCase().split(" ").join("_")}`;
    const testPath = path.join(
        appRoot.toString(), 
        '_tests',
        'db_migrations', 
        `${name}.test.js`);
    const jsName = `${name}.js`;
    const filePath = path.join(
        appRoot.toString(), 
        'db_migrations', 
        jsName);

    try {
        // actual migration
        await fs.promises.writeFile(filePath,
`const { getPool } = require('../db/postgres');
const pool = getPool();
        
const up = async() => {
    return await pool
        .query(\`CREATE TABLE table_name (
            id uuid DEFAULT uuid_generate_v4 (),
            PRIMARY KEY(id)
        );\`);
}

const down = async() => {
    return await pool
        .query(\`DROP TABLE IF EXISTS table_name; \`);
}

module.exports = {
    up,
    down
}
`);     
        // test case
        await fs.promises.writeFile(testPath, 
`const { getPool, closePool } = require('../../db/postgres');
const {up, down} = require('../../db_migrations/${name}.js');
const pool = getPool();


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

createMigration(argv[0])
.then((fileName) => console.log(`Success! ${fileName} created`))
.catch((e) => console.log(e.toString()))
.finally(() => process.exit());
