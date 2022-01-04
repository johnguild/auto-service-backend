const { getPool, closePool } = require('../../db/postgres');
const {up, down} = require('../../db_migrations/1641297582352_create_products_table.js');
const pool = getPool();
const Product = require('../../product/product.model');

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
        const res = await pool.query(`SELECT to_regclass('${Product.tableName}');`);
        expect(res.rows[0].to_regclass).toBe(Product.tableName);
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
        const res = await pool.query(`SELECT to_regclass('${Product.tableName}');`);
        expect(res.rows[0].to_regclass).toBeNull();
    });
});

