const { getPool, closePool } = require('../../db/postgres');
const {up, down} = require('../../db_migrations/1647022126173_create_order_mechanics_table.js');
const pool = getPool();
const OrderMechanic = require('../../order/orderMechanics.model.js');


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
        const res = await pool.query(`SELECT to_regclass('${OrderMechanic.tableName}');`);
        expect(res.rows[0].to_regclass).toBe(OrderMechanic.tableName);
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
        const res = await pool.query(`SELECT to_regclass('${OrderMechanic.tableName}');`);
        expect(res.rows[0].to_regclass).toBeNull();
    });
});

