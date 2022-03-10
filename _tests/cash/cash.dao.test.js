const jwt = require('jsonwebtoken');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const cashMigration0 = require('../../db_migrations/1646914540177_create_cashes_table');

const Cash = require('../../cash/cash.model');
const cashDAO = require('../../cash/cash.dao');

const cashData = {
    amount: 1209
}



beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await cashMigration0.down();
    // migrate tables
    await cashMigration0.up();
});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Cash.tableName};`);
});

afterAll( async() => {
    await cashMigration0.down();
    await closePool();
});


describe('insert', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        let err = null;
        try {
            await cashDAO.insert(cashData);

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert cash saved
        const res = await pool.query(`SELECT * FROM ${Cash.tableName};`);
        expect(res.rows.length).toBe(1);
        expect(parseInt(res.rows[0].amount)).toBe(cashData.amount);
    });

});

describe('update', () => {

    it('when updating amount, will succeed', async() => {
        // create data first
        const cash = await cashDAO.insert(cashData);

        // console.log(cash.id);

        const newAmount = 300;

        let err = null;
        try {
            await cashDAO.update(
                data={amount: newAmount},
                where={id: cash.id}
            );

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();

        // assert values updated
        const savedCash = await pool.query(`SELECT * FROM ${Cash.tableName};`);
        expect(savedCash.rows.length).toBe(1);
        expect(savedCash.rows[0].id).toBe(cash.id);
        expect(parseInt(savedCash.rows[0].amount)).toBe(newAmount);

    });


});

describe('find', () => {

    it('when finding by mobile on records, will succeed', async() => {
        /// create cashs first
        const cash = await cashDAO.insert(cashData);

        const customerData = [
            {
                amount: 900
            },
            {
                amount: 2000
            },
        ]

        for (const data of customerData) {
            const c = await cashDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await cashDAO.find( 
                where= { } 
            );

            expect(search1.length).toBe(3);
            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with limit, will succeed', async() => {

        /// create cashs first
        const cash = await cashDAO.insert(cashData);

        const customerData = [
            {
                amount: 300
            },
            {
                amount: 900
            },
            {
                amount: 2000
            },
        ]

        for (const data of customerData) {
            const c = await cashDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await cashDAO.find( 
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

        /// create cashs first
        const cash = await cashDAO.insert(cashData);

        const customerData = [
            {
                amount: 1000
            },
            {
                amount: 900
            },
            {
                amount: 2000
            },
        ]

        for (const data of customerData) {
            const c = await cashDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await cashDAO.find( 
                where= {},
                options= {skip: 2}
            );

            expect(searchRes.length).toBe(2);

            // console.log(searchRes);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with limit and skip, will succeed', async() => {

        /// create cashs first
        const cash = await cashDAO.insert(cashData);

        const customerData = [
            {
                amount: 1000
            },
            {
                amount: 900
            },
            {
                amount: 2000
            },
        ]

        for (const data of customerData) {
            const c = await cashDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await cashDAO.find( 
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


describe('findTotal', () => {

    it('when finding total on empty records, will succeed', async() => {
       
        let err = null;
        try {
            const total = await cashDAO.findTotal();

            expect(parseInt(total)).toBe(0);
            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });


    it('when finding total on records, will succeed', async() => {
        /// create cashs first
        const cash = await cashDAO.insert(cashData);

        const customerData = [
            {
                amount: 900
            },
            {
                amount: 2000
            },
        ]

        for (const data of customerData) {
            const c = await cashDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const total = await cashDAO.findTotal();

            expect(parseInt(total)).toBe((cashData.amount + customerData[0].amount + customerData[1].amount));
            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });
});



