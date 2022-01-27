const jwt = require('jsonwebtoken');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const productMigration0 = require('../../db_migrations/1641297582352_create_products_table');

const Product = require('../../product/product.model');
const productDAO = require('../../product/product.dao');

const product1Data = {
    name: 'Product 1',
    sku: '123456',
    description: 'Description 1',
    stock: 12,
    price: 100.5,
}


beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await productMigration0.down();
    // migrate tables
    await productMigration0.up();
});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Product.tableName};`);
});

afterAll( async() => {
    await productMigration0.down();
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
        expect(parseFloat(res.rows[0].price)).toBe(product1Data.price);
        expect(parseFloat(res.rows[0].stock)).toBe(product1Data.stock);
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
        expect(res.rows[0].sku).toBe(product1Data.sku);
        expect(res.rows[0].description).toBe(product1Data.description);
        expect(parseFloat(res.rows[0].price)).toBe(0.0);
        expect(parseFloat(res.rows[0].stock)).toBe(product1Data.stock);
    });

    it('when creating with duplicate sku, will fail', async() => {

        await productDAO.insert(product1Data);

        let err = null;
        try {
            await productDAO.insert(product1Data);

        } catch (error) {
            err = error;
        }
        expect(err).not.toBeNull();

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

    it('when updating price, discountedPrice, is_public by id, will succeed', async() => {
        // create data first
        const product = await productDAO.insert(product1Data);

        // console.log(manager.id);

        const newStock = 111;
        const newPrice = 99.99;

        let err = null;
        try {
            await productDAO.update(
                data={
                    stock: newStock,
                    price: newPrice,
                },
                where={id: product.id}
            );

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();

        // assert values updated
        const savedProduct = await pool.query(`SELECT * FROM ${Product.tableName};`);
        expect(savedProduct.rows.length).toBe(1);
        expect(savedProduct.rows[0].id).toBe(product.id);
        expect(parseFloat(savedProduct.rows[0].stock)).toBe(newStock);
        expect(parseFloat(savedProduct.rows[0].price)).toBe(newPrice);

    });

});

describe('find', () => {

    it('when finding by sku on records, will succeed', async() => {
        /// create products first
        const productData = [
            {
                name: 'Product 1',
                sku: '123456',
                description: 'Description 1',
                stock: 12,
                price: 100.5,
            },
            {
                name: 'Product 2',
                sku: '0003123123',
                description: 'Description 2',
                stock: 12,
                price: 100.5,
            },
        ]

        for (const data of productData) {
            const c = await productDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await productDAO.find( 
                where= {sku: productData[1].sku } 
            );

            expect(search1.length).toBe(1);
            expect(search1[0].sku).toBe(productData[1].sku);

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
                sku: '123456',
                description: 'Description 1',
                stock: 12,
                price: 100.5,
            },
            {
                name: 'Product 2',
                sku: '0003123123',
                description: 'Description 2',
                stock: 12,
                price: 100.5,
            },
            {
                name: 'Product 3',
                sku: '000414444',
                description: 'Description 3',
                stock: 120,
                price: 2000,
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
                sku: '123456',
                description: 'Description 1',
                stock: 12,
                price: 100.5,
            },
            {
                name: 'Product 2',
                sku: '0003123123',
                description: 'Description 2',
                stock: 12,
                price: 100.5,
            },
            {
                name: 'Product 3',
                sku: '000414444',
                description: 'Description 3',
                stock: 120,
                price: 2000,
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
                sku: '123456',
                description: 'Description 1',
                stock: 12,
                price: 100.5,
            },
            {
                name: 'Product 2',
                sku: '0003123123',
                description: 'Description 2',
                stock: 12,
                price: 100.5,
            },
            {
                name: 'Product 3',
                sku: '000414444',
                description: 'Description 3',
                stock: 120,
                price: 2000,
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

    it('when finding by sku on records, will succeed', async() => {
        /// create products first
        const productData = [
            {
                name: 'Product 1',
                sku: '123456',
                description: 'Description 1',
                stock: 12,
                price: 100.5,
            },
            {
                name: 'Product 2',
                sku: '0003123123',
                description: 'Description 2',
                stock: 12,
                price: 100.5,
            },
            {
                name: 'Product 3',
                sku: '000767676',
                description: 'Description 3',
                stock: 12,
                price: 200.5,
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
                    name: '123',
                    sku: '123',
                    description: '123',
                } 
            );

            expect(search1.length).toBe(2);

            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });
    
    it('when finding by sku on records, will succeed', async() => {
        /// create products first
        const productData = [
            {
                name: 'Product 1',
                sku: '123456',
                description: 'Description 1',
                stock: 12,
                price: 100.5,
            },
            {
                name: 'Product 2',
                sku: '0003123123',
                description: 'Description 2',
                stock: 12,
                price: 100.5,
            },
            {
                name: 'Product 3',
                sku: '000767676',
                description: 'Sample 3',
                stock: 12,
                price: 200.5,
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
                    name: 'Sample',
                    sku: 'Sample',
                    description: 'Sample',
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




