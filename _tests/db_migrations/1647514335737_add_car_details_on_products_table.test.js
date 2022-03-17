const { getPool, closePool } = require('../../db/postgres');
const addTable = require('../../db_migrations/1641297582352_create_products_table');
const {up, down} = require('../../db_migrations/1647514335737_add_car_details_on_products_table.js');
const pool = getPool();
const Product = require('../../product/product.model.js');


afterAll( async () => {
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
            WHERE table_schema = 'public' AND table_name = '${Product.tableName}';`);
        // expect(res.rows[0].to_regclass).toBe(Product.tableName);
        // console.dir(res, {depth: null});

        let hasCarMake = false, hasCarType = false, hasCarYear = false, hasCarPart = false;
        res.rows.forEach(ele => {
            if (ele.column_name === 'car_make') hasCarMake = true;
            if (ele.column_name === 'car_type') hasCarType = true;
            if (ele.column_name === 'car_year') hasCarYear = true;
            if (ele.column_name === 'car_part') hasCarPart = true;
        });
        expect(hasCarMake).toBe(true);
        expect(hasCarType).toBe(true);
        expect(hasCarYear).toBe(true);
        expect(hasCarPart).toBe(true);

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
            WHERE table_schema = 'public' AND table_name = '${Product.tableName}';`);
        // expect(res.rows[0].to_regclass).toBe(Product.tableName);
        // console.dir(res, {depth: null});

        let hasCarMake = false, hasCarType = false, hasCarYear = false, hasCarPart = false;
        res.rows.forEach(ele => {
            if (ele.column_name === 'car_make') hasCarMake = true;
            if (ele.column_name === 'car_type') hasCarType = true;
            if (ele.column_name === 'car_year') hasCarYear = true;
            if (ele.column_name === 'car_part') hasCarPart = true;
        });
        expect(hasCarMake).toBe(false);
        expect(hasCarType).toBe(false);
        expect(hasCarYear).toBe(false);
        expect(hasCarPart).toBe(false);

        await addTable.down();
    });
});

