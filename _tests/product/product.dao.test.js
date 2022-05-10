const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();


const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const productMigration0 = require('../../db_migrations/1641297582352_create_products_table');
const productMigration1 = require('../../db_migrations/1647514335737_add_car_details_on_products_table');
const Product = require('../../product/product.model');
const productDAO = require('../../product/product.dao');

const stockMigration0 = require('../../db_migrations/1641300048254_create_stocks_table');
const Stock = require('../../stock/stock.model');
const stockDAO = require('../../stock/stock.dao');


const personnelData = {
    email: 'johnrobin.autoproduct@gmail.com',
    mobile: '639359372676',
    password: 'P@ssW0rd',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_PERSONNEL,
}

const product1Data = {
    name: 'Product 1',
    description: 'Description 1',
}

let personnel, product;

beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await userMigration0.down();
    await productMigration0.down();
    await stockMigration0.down();
    // migrate tables
    await userMigration0.up();
    await productMigration0.up();
    await productMigration1.up();
    await stockMigration0.up();


    const personnelEncryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    personnel = await userDAO.insert(data = {
        ...personnelData,
        password: personnelEncryptedPass,
    });     

});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Product.tableName};`);
    await pool.query(`DELETE FROM ${Stock.tableName};`);
});

afterAll( async() => {
    await userMigration0.down();
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


    it('when finding by supplier on records, will succeed', async() => {
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
        ];

        const stocksData = [
            {
                supplier: 'Supplier s1',
                quantity: 12,
                unitPrice: 80,
                sellingPrice: 100,
            },
            {
                supplier: 'Supplier s2',
                quantity: 12,
                unitPrice: 80,
                sellingPrice: 100,
            }
        ]

        for (const pData of productData) {
            const p = await productDAO.insert(pData);
            // console.log(p);
            // add new stock
            const s1 = await stockDAO.insert({
                personnelId: personnel.id,
                productId: p.id,
                ...stocksData[0]
            });
            // console.log(s1);

            if (pData.name != productData[1].name) {
                const s2= await stockDAO.insert({
                    personnelId: personnel.id,
                    productId: p.id,
                    ...stocksData[1]
                });
                // console.log(s2);
            }
        }



        let err = null;
        try {
            const search1 = await productDAO.find( 
                where= {},
                options= {
                    likeSupplier: 's2'
                } 
            );
            expect(search1.length).toBe(1);

            const search2 = await productDAO.find( 
                where= {},
                options= {
                    likeSupplier: 'sup'
                } 
            );
            expect(search2.length).toBe(2);

            const search3 = await productDAO.find( 
                where= {},
                options= {
                    like: 'prod',
                    likeSupplier: 'sup'
                } 
            );
            expect(search3.length).toBe(2);


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




