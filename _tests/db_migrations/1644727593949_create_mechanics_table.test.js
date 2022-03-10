const { getPool, closePool } = require('../../db/postgres');
const {up, down} = require('../../db_migrations/1644727593949_create_mechanics_table.js');
const pool = getPool();
const Mechanic = require('../../mechanic/mechanic.model.js');


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
        const res = await pool.query(`SELECT to_regclass('${Mechanic.tableName}');`);
        expect(res.rows[0].to_regclass).toBe(Mechanic.tableName);
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
        const res = await pool.query(`SELECT to_regclass('${Mechanic.tableName}');`);
        expect(res.rows[0].to_regclass).toBeNull();
    });
});

