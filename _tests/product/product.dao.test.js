const jwt = require('jsonwebtoken');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const productMigration0 = require('../../db_migrations/1641297582352_create_products_table');
const productMigration1 = require('../../db_migrations/1647514335737_add_car_details_on_products_table');
const Product = require('../../product/product.model');
const productDAO = require('../../product/product.dao');

const stockMigration0 = require('../../db_migrations/1641300048254_create_stocks_table');
const Stock = require('../../stock/stock.model');
const stockDAO = require('../../stock/stock.dao');

const product1Data = {
    name: 'Product 1',
    description: 'Description 1',
}


beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await productMigration0.down();
    await stockMigration0.down();
    // migrate tables
    await productMigration0.up();
    await productMigration1.up();
    await stockMigration0.up();
});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Product.tableName};`);
    await pool.query(`DELETE FROM ${Stock.tableName};`);
});

afterAll( async() => {
    await productMigration0.down();
    await stockMigration0.down();
    await closePool();
});


describe('insert', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        let err = null;
        try {
            await productDAO.insert(product1Data);

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert product saved
        const res = await pool.query(`SELECT * FROM ${Product.tableName};`);
        expect(res.rows.length).toBe(1);
        expect(res.rows[0].name).toBe(product1Data.name);
        expect(res.rows[0].sku).toBe(product1Data.sku);
        expect(res.rows[0].description).toBe(product1Data.description);
    });

    it('when creating with valid but without price, will succeed', async() => {

        let err = null;
        try {
            await productDAO.insert({
                ...product1Data,
                price: undefined
            });

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert product saved
        const res = await pool.query(`SELECT * FROM ${Product.tableName};`);
        expect(res.rows[0].name).toBe(product1Data.name);
        expect(res.rows[0].description).toBe(product1Data.description);
    });

});

describe('update', () => {

    it('when updating email and last_name by id, will succeed', async() => {
        // create data first
        const product = await productDAO.insert(product1Data);

        // console.log(manager.id);

        const newName = 'This is a new name';
        const newDescription = 'New Description';

        let err = null;
        try {
            const updated = await productDAO.update(
                data={name: newName, description: newDescription},
                where={id: product.id }
            );

            // console.log(updated);

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();

        // assert values updated
        const savedProduct = await pool.query(`SELECT * FROM ${Product.tableName};`);
        expect(savedProduct.rows.length).toBe(1);
        expect(savedProduct.rows[0].id).toBe(product.id);
        expect(savedProduct.rows[0].name).toBe(newName);
        expect(savedProduct.rows[0].description).toBe(newDescription);

    });

});

describe('find', () => {

    it('when finding by name on records, will succeed', async() => {
        /// create products first
        const productData = [
            {
                name: 'Product 1',
                description: 'Description 1',
            },
            {
                name: 'Product 2',
                description: 'Description 2',
            },
        ]

        for (const data of productData) {
            const c = await productDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await productDAO.find( 
                where= {name: productData[1].name } 
            );

            expect(search1.length).toBe(1);

            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with limit, will succeed', async() => {

        /// create products first
        const productData = [
            {
                name: 'Product 1',
                description: 'Description 1',
            },
            {
                name: 'Product 2',
                description: 'Description 2',
            },
            {
                name: 'Product 3',
                description: 'Description 3',
            },
        ]

        for (const data of productData) {
            const c = await productDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await productDAO.find( 
                where= {},
                options= {limit: 2}
            );

            expect(searchRes.length).toBe(2);

            // console.log(searchRes);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with skip, will succeed', async() => {

        /// create products first
        const productData = [
            {
                name: 'Product 1',
                description: 'Description 1',
            },
            {
                name: 'Product 2',
                description: 'Description 2',
            },
            {
                name: 'Product 3',
                description: 'Description 3',
            },
        ]

        for (const data of productData) {
            const c = await productDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await productDAO.find( 
                where= {},
                options= {skip: 2}
            );

            expect(searchRes.length).toBe(1);

            // console.log(searchRes);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with limit and skip, will succeed', async() => {

        /// create products first
        const productData = [
            {
                name: 'Product 1',
                description: 'Description 1',
            },
            {
                name: 'Product 2',
                description: 'Description 2',
            },
            {
                name: 'Product 3',
                description: 'Description 3',
            },
        ]

        for (const data of productData) {
            const c = await productDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await productDAO.find( 
                where= {},
                options= {limit: 1, skip: 1}
            );

            expect(searchRes.length).toBe(1);

            // console.log(searchRes);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });
});


describe('findLike', () => {

    it('when finding by name on records, will succeed', async() => {
        /// create products first
        const productData = [
            {
                name: 'Product 1',
                description: 'Description 1',
            },
            {
                name: 'Product 2',
                description: 'Description 2',
            },
            {
                name: 'Product 3',
                description: 'Description 3',
            },
        ]

        for (const data of productData) {
            const c = await productDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await productDAO.findLike( 
                where= {
                    name: '2',
                    description: '3',
                } 
            );

            expect(search1.length).toBe(2);

            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });
    
    it('when finding by name on records, will succeed', async() => {
        /// create products first
        const productData = [
            {
                name: 'Product 1',
                description: 'Description 1',
            },
            {
                name: 'Product 2',
                description: 'Description 2',
            },
            {
                name: 'Product 3',
                description: 'Sample 3',
            },
        ]

        for (const data of productData) {
            const c = await productDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await productDAO.findLike( 
                where= {
                    name: '1',
                    description: '1',
                } 
            );

            expect(search1.length).toBe(1);

            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

});




