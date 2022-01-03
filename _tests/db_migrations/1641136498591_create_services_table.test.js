const { getPool, closePool } = require('../../db/postgres');
const {up, down} = require('../../db_migrations/1641136498591_create_services_table.js');
const pool = getPool();
const Service = require('../../service/service.model');


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
        const res = await pool.query(`SELECT to_regclass('${Service.tableName}');`);
        expect(res.rows[0].to_regclass).toBe(Service.tableName);
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
        const res = await pool.query(`SELECT to_regclass('${Service.tableName}');`);
        expect(res.rows[0].to_regclass).toBeNull();
    });
});

