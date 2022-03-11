const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const productMigration0 = require('../../db_migrations/1641297582352_create_products_table');
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

const productData = {
    name: 'Product 1',
    sku: '123456',
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
    await stockMigration0.up();


    const personnelEncryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    personnel = await userDAO.insert(data = {
        ...personnelData,
        password: personnelEncryptedPass,
    });     

    product = await productDAO.insert(productData);

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

        const stockData = {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 120,
            unitPrice: 300.5,
            sellingPrice: 330,
        }

        let stock;
        let err = null;
        try {
            stock = await stockDAO.insert(stockData);

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert product saved
        expect(stock.productId).toBe(stockData.productId);
        expect(stock.personnelId).toBe(stockData.personnelId);
        expect(stock.supplier).toBe(stockData.supplier);
        expect(parseInt(stock.quantity)).toBe(stockData.quantity);
        expect(parseFloat(stock.unitPrice)).toBe(stockData.unitPrice);
        expect(parseFloat(stock.sellingPrice)).toBe(stockData.sellingPrice);
    });

});

describe('update', () => {

    it('when updating by id, will succeed', async() => {

        const stockData = {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 120,
            unitPrice: 300.5,
            sellingPrice: 330,
        }

        const stock = await stockDAO.insert(stockData);

        const newQuantity = 100;
        const newSellingPrice = 360;

        let updated;
        let err = null;
        try {
            updated = await stockDAO.update(
                data={quantity: newQuantity, sellingPrice: newSellingPrice},
                where={id: stock.id }
            );

            // console.log(updated);

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();
        
        const res = await pool.query(`SELECT * FROM ${Stock.tableName};`);
        expect(res.rows[0].product_id).toBe(stockData.productId);
        expect(res.rows[0].personnel_id).toBe(stockData.personnelId);
        expect(res.rows[0].supplier).toBe(stockData.supplier);
        expect(parseFloat(res.rows[0].unit_price)).toBe(stockData.unitPrice);
        expect(parseInt(res.rows[0].quantity)).toBe(newQuantity);
        expect(parseFloat(res.rows[0].selling_price)).toBe(newSellingPrice);

    });

});

describe('find', () => {

    it('when finding by productId, will succeed', async() => {
        /// create products first
        const stockData = [
            {
                productId: product.id,
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 90,
                unitPrice: 290,
                sellingPrice: 330,
            },
            {
                productId: product.id,
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 120,
                unitPrice: 300.5,
                sellingPrice: 330,
            },
            {
                productId: personnel.id,// should not be counted
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 120,
                unitPrice: 300.5,
                sellingPrice: 330,
            },
        ]

        for (const data of stockData) {
            const c = await stockDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await stockDAO.find( 
                where= {productId: product.id } 
            );

            expect(search1.length).toBe(2);

            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with limit, will succeed', async() => {

         /// create products first
         const stockData = [
            {
                productId: product.id,
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 90,
                unitPrice: 290,
                sellingPrice: 330,
            },
            {
                productId: product.id,
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 120,
                unitPrice: 300.5,
                sellingPrice: 330,
            },
            {
                productId: personnel.id,// should not be counted
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 120,
                unitPrice: 300.5,
                sellingPrice: 330,
            },
        ]

        for (const data of stockData) {
            const c = await stockDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await stockDAO.find( 
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
         const stockData = [
            {
                productId: product.id,
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 90,
                unitPrice: 290,
                sellingPrice: 330,
            },
            {
                productId: product.id,
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 120,
                unitPrice: 300.5,
                sellingPrice: 330,
            },
            {
                productId: personnel.id,// should not be counted
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 120,
                unitPrice: 300.5,
                sellingPrice: 330,
            },
        ]

        for (const data of stockData) {
            const c = await stockDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await stockDAO.find( 
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
         const stockData = [
            {
                productId: product.id,
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 90,
                unitPrice: 290,
                sellingPrice: 330,
            },
            {
                productId: product.id,
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 120,
                unitPrice: 300.5,
                sellingPrice: 330,
            },
            {
                productId: personnel.id,// should not be counted
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 120,
                unitPrice: 300.5,
                sellingPrice: 330,
            },
        ]

        for (const data of stockData) {
            const c = await stockDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await stockDAO.find( 
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

    it('when finding by supplier on records, will succeed', async() => {
         /// create products first
         const stockData = [
            {
                productId: product.id,
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 90,
                unitPrice: 290,
                sellingPrice: 330,
            },
            {
                productId: product.id,
                personnelId: personnel.id,
                supplier: 'Some Supplier',
                quantity: 120,
                unitPrice: 300.5,
                sellingPrice: 330,
            },
            {
                productId: personnel.id,// should not be counted
                personnelId: personnel.id,
                supplier: 'Another Supplier',
                quantity: 120,
                unitPrice: 300.5,
                sellingPrice: 330,
            },
        ]

        for (const data of stockData) {
            const c = await stockDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await stockDAO.findLike( 
                where= {
                    supplier: 'Some',
                } 
            );

            expect(search1.length).toBe(2);

            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });
    
    

});




