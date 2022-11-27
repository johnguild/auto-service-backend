const bcrypt = require('bcryptjs');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');


const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const Product = require('../../product/product.model');
const ProductArchive = require('../../product/product_archive.model');
const productDAO = require('../../product/product.dao');

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
    await migrate.down();
    // migrate tables
    await migrate.up();


    const personnelEncryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    personnel = await userDAO.insert(data = {
        ...personnelData,
        password: personnelEncryptedPass,
    });     

});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Product.tableName};`);
    await pool.query(`DELETE FROM ${Stock.tableName};`);
    await pool.query(`DELETE FROM ${ProductArchive.tableName};`);
});

afterAll( async() => {
    await migrate.down();
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


    it('when finding with order, will succeed', async() => {
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
            {
                name: 'Product 4',
                description: 'Description 4',
            },
        ]

        for (const data of productData) {
            const c = await productDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const products = await productDAO.find( 
                where= {},
                options= {
                    limit: 2,
                    skip: 1,
                    orderByColumn: 'name',
                    orderByRule: 'desc'
                } 
            );

            expect(products.length).toBe(2);
            expect(products[0].name).toBe(productData[2].name);

            // console.log(searchRes[0]);
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
  
    it('when finding with stocks, will succeed', async() => {
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
                },
                options= {
                    withStocks: true,
                } 
            );

            expect(search1.length).toBe(0);

            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });


});


describe('insertArchive', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        const prod = await productDAO.insert(product1Data);

        let err = null;
        try {
            await productDAO.insertArchive({
                productId: prod.id,
                requestedBy: personnel.id,
                requestedComment: 'Test Comment', 
            })
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert product saved
        const res = await pool.query(`SELECT * FROM ${ProductArchive.tableName};`);
        expect(res.rows.length).toBe(1);
        expect(res.rows[0].product_id).toBe(prod.id);
        expect(res.rows[0].requested_by).toBe(personnel.id);
        expect(res.rows[0].requested_comment).toBe('Test Comment');
        expect(res.rows[0].requested_at).not.toBeNull();
    });
   
});

describe('updateArchive', () => {

    it('when updating with valid and complete data, will succeed', async() => {

        const prod = await productDAO.insert(product1Data);
        const archive = await productDAO.insertArchive({
            productId: prod.id,
            requestedBy: personnel.id,
            requestedComment: 'Test Comment', 
        }) ;

        const timestamp = new Date().toISOString();
        let err = null;
        try {
            await productDAO.updateArchive(
                {
                    requestedComment: 'Updated Comment', 
                    approvedBy: personnel.id, 
                    approvedAt: timestamp,
                    declinedBy: personnel.id,
                    declinedAt: timestamp,
                },
                {
                    id: archive.id,
                }
            );
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert product saved
        const res = await pool.query(`SELECT * FROM ${ProductArchive.tableName};`);
        expect(res.rows.length).toBe(1);
        expect(res.rows[0].product_id).toBe(prod.id);
        expect(res.rows[0].requested_by).toBe(personnel.id);
        expect(res.rows[0].requested_comment).toBe('Updated Comment');
        expect(res.rows[0].requested_at).not.toBeNull();
        expect(res.rows[0].approved_by).toBe(personnel.id);
        expect(new Date(res.rows[0].approved_at).toISOString()).toBe(timestamp);
        expect(res.rows[0].declined_by).toBe(personnel.id);
        expect(new Date(res.rows[0].declined_at).toISOString()).toBe(timestamp);
    });
   
});




describe('findArchive', () => {

    it('when finding all data, will succeed', async() => {

        const prod = await productDAO.insert(product1Data);

        await productDAO.insertArchive({
            productId: prod.id,
            requestedBy: personnel.id,
            requestedComment: 'Test Comment', 
        }) ;


        const prod2 = await productDAO.insert({
            name: 'Product 1',
            description: 'Description 1',
        });
        await productDAO.insertArchive({
            productId: prod2.id,
            requestedBy: personnel.id,
            requestedComment: 'Test Comment 2', 
        }) ;


        let archives = [];
        let err = null;
        try {
            archives = await productDAO.findArchive(
                {},
                {limit: 10, skip: 0}
            );
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // console.dir(archives, {depth: null});
        expect(archives.length).toBe(2);
    });
   
    it('when finding with limit and skip, will succeed', async() => {

        const prod = await productDAO.insert(product1Data);
        await productDAO.insertArchive({
            productId: prod.id,
            requestedBy: personnel.id,
            requestedComment: 'Test Comment', 
        }) ;


        const prod2 = await productDAO.insert({
            name: 'Product 2',
            description: 'Description 2',
        });
        await productDAO.insertArchive({
            productId: prod2.id,
            requestedBy: personnel.id,
            requestedComment: 'Test Comment 2', 
        }) ;

        const prod3 = await productDAO.insert({
            name: 'Product 3',
            description: 'Description 3',
        });
        await productDAO.insertArchive({
            productId: prod3.id,
            requestedBy: personnel.id,
            requestedComment: 'Test Comment 3', 
        }) ;


        let archives = [];
        let err = null;
        try {
            archives = await productDAO.findArchive(
                {},
                {limit: 1, skip: 1}
            );
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // console.dir(archives, {depth: null});
        expect(archives.length).toBe(1);
        expect(archives[0].productId).toBe(prod2.id);
    });


});