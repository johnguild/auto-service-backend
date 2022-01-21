const { getPool, closePool } = require('../../db/postgres');
const {up, down} = require('../../db_migrations/1642766434532_create_order_services_table.js');
const pool = getPool();
const OrderServices = require('../../order/orderServices.model');


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
        const res = await pool.query(`SELECT to_regclass('${OrderServices.tableName}');`);
        expect(res.rows[0].to_regclass).toBe(OrderServices.tableName);
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
        const res = await pool.query(`SELECT to_regclass('${OrderServices.tableName}');`);
        expect(res.rows[0].to_regclass).toBeNull();
    });
});

