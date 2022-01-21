const { getPool, closePool } = require('../../db/postgres');
const {up, down} = require('../../db_migrations/1642765556944_create_orders_table.js');
const pool = getPool();
const Order = require('../../order/order.model');


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
        const res = await pool.query(`SELECT to_regclass('${Order.tableName}');`);
        expect(res.rows[0].to_regclass).toBe(Order.tableName);
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
        const res = await pool.query(`SELECT to_regclass('${Order.tableName}');`);
        expect(res.rows[0].to_regclass).toBeNull();
    });
});

