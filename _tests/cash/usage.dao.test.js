const jwt = require('jsonwebtoken');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const Cash = require('../../cash/cash.model');
const cashDAO = require('../../cash/cash.dao');

const Usage = require('../../cash/usage.model');
const usageDAO = require('../../cash/usage.dao');

const cashData = {
    amount: 1209,
}



beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await migrate.down();
    // migrate tables
    await migrate.up();
    
});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Cash.tableName};`);
    await pool.query(`DELETE FROM ${Usage.tableName};`);
});

afterAll( async() => {
    await migrate.down();
    await closePool();
});


describe('insert', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        let err = null;
        try {
            const cash = await cashDAO.insert(cashData);

            await usageDAO.insert({
                amount: 120,
                cashId: cash.id,
                purpose: 'Nothing',
            });

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // // assert cash saved
        // const res = await pool.query(`SELECT * FROM ${Cash.tableName};`);
        // expect(res.rows.length).toBe(1);
        // expect(parseInt(res.rows[0].amount)).toBe(cashData.amount);
    });

});

describe('update', () => {

    it('when updating amount, will succeed', async() => {
        // create data first
        const cash = await cashDAO.insert(cashData);
        const usage = await usageDAO.insert({
            amount: 100.5,
            cashId: cash.id,
            purpose: 'Nothing' 
        });

        // console.log(cash.id);

        const newAmount = 300;

        let err = null;
        try {
            await usageDAO.update(
                data={amount: newAmount},
                where={id: usage.id}
            );

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();

        // assert values updated
        const savedCash = await pool.query(`SELECT * FROM ${Usage.tableName};`);
        expect(savedCash.rows.length).toBe(1);
        expect(savedCash.rows[0].id).toBe(usage.id);
        expect(parseInt(savedCash.rows[0].amount)).toBe(newAmount);

    });


});

describe('find', () => {

    it('when finding by mobile on records, will succeed', async() => {
        /// create cashs first
        const cash = await cashDAO.insert(cashData);

        const customerData = [
            {
                amount: 900,
                cashId: cash.id,
                purpose: 'Nothing',
            },
            {
                amount: 2000,
                cashId: cash.id,
                purpose: 'Nothing',
            },
        ]

        for (const data of customerData) {
            const c = await usageDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await usageDAO.find( 
                where= { cashId: cash.id  } 
            );

            expect(search1.length).toBe(2);
            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    
});



