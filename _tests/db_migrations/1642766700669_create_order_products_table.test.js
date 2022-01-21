const { getPool, closePool } = require('../../db/postgres');
const {up, down} = require('../../db_migrations/1642766700669_create_order_products_table.js');
const pool = getPool();
const OrderProducts = require('../../order/orderProducts.model');


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
        const res = await pool.query(`SELECT to_regclass('${OrderProducts.tableName}');`);
        expect(res.rows[0].to_regclass).toBe(OrderProducts.tableName);
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
        const res = await pool.query(`SELECT to_regclass('${OrderProducts.tableName}');`);
        expect(res.rows[0].to_regclass).toBeNull();
    });
});

