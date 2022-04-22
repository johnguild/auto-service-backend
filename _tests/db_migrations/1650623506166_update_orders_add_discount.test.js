const { getPool, closePool } = require('../../db/postgres');
const addTable = require('../../db_migrations/1642765556944_create_orders_table');
const {up, down} = require('../../db_migrations/1650623506166_update_orders_add_discount.js');
const pool = getPool();
const Order = require('../../order/order.model.js');


beforeAll( async () => {

});

afterAll( async () => {
    await addTable.down();
    await closePool();
});

describe('up', () => {
    it('when migrating, will succeed', async() => {
        let err = null;
        try {
            await new Promise(resolve => setTimeout(() => resolve(), 100));
            await addTable.up();
            await up();
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();
        
        
        // do some assertion
        const res = await pool.query(`SELECT * FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${Order.tableName}';`);
        // expect(res.rows[0].to_regclass).toBe(Product.tableName);
        // console.dir(res, {depth: null});

        let hasDiscount = false, hasSubTotal = false;
        res.rows.forEach(ele => {
            if (ele.column_name === 'discount') hasDiscount = true;
            if (ele.column_name === 'sub_total') hasSubTotal = true;
        });
        expect(hasDiscount).toBe(true);
        expect(hasSubTotal).toBe(true);
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
        const res = await pool.query(`SELECT * FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${Order.tableName}';`);
        // expect(res.rows[0].to_regclass).toBe(Product.tableName);
        // console.dir(res, {depth: null});

        let hasDiscount = false, hasSubTotal = false;
        res.rows.forEach(ele => {
            if (ele.column_name === 'discount') hasDiscount = true;
            if (ele.column_name === 'sub_total') hasSubTotal = true;
        });
        expect(hasDiscount).toBe(false);
        expect(hasSubTotal).toBe(false);
    });
});

