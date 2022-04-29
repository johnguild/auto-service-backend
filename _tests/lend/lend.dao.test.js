const jwt = require('jsonwebtoken');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const lendMigration0 = require('../../db_migrations/1650029430483_create_lends_table');
const Lend = require('../../lend/lend.model');
const lendDAO = require('../../lend/lend.dao');

const mechanicMigration0 = require('../../db_migrations/1644727593949_create_mechanics_table');
const Mechanic = require('../../mechanic/mechanic.model');
const mechanicDAO = require('../../mechanic/mechanic.dao');

const toolMigration0 = require('../../db_migrations/1648809625370_create_tools_tables');
const Tool = require('../../tool/tool.model');
const toolDAO = require('../../tool/tool.dao');


const tools = [];
const mechanics = [];


beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await lendMigration0.down();
    await mechanicMigration0.down();
    await toolMigration0.down();
    // migrate tables
    await lendMigration0.up();
    await mechanicMigration0.up();
    await toolMigration0.up();

    /// create tools
    for (const i of [
        {
            name: 'Repair Tool',
            description: 'Something here',
            cover: 'base64string here',
            quantity: 100,
            available: 100,
        },
        {
            name: 'Repair Tool 2',
            description: 'Something here',
            cover: 'base64string here',
            quantity: 99,
            available: 100,
        },
        {
            name: 'Repair Tool 3',
            description: 'Something here',
            cover: 'base64string here',
            quantity: 60,
            available: 100,
        },
    ]) {
        const res = await toolDAO.insert(i);
        tools.push(res);
    }

    /// create mechanics
    for (const i of [
        {
            mobile: '639359372680',
            firstName: 'Mup',
            lastName: 'Ta',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Female',
        },
        {
            mobile: '639359372677',
            firstName: 'Hoshi',
            lastName: 'Persian',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Male',
        },
        {
            mobile: '639359372678',
            firstName: 'Chiyo',
            lastName: 'Himalayan',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Male',
        },
    ]) {
        const res = await mechanicDAO.insert(i);
        mechanics.push(res);
    }
});

beforeEach( async() => {
    await pool.query(`
        DELETE FROM ${Lend.tableName};
    `);
});

afterAll( async() => {
    await lendMigration0.down();
    await mechanicMigration0.down();
    await toolMigration0.down();
    await closePool();
});


describe('insert', () => {

    it('when creating with valid and without products, will succeed', async() => {

        const lendData = {
            toolId: tools[0].id,
            mechanicId: mechanics[1].id,
            quantity: 1,
            borrowedAt: new Date().toISOString(),
        }

        let lend;
        let err = null;
        try {
            lend = await lendDAO.insert(lendData);

            // console.dir(lend, {depth: null});

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert lend saved
        const res = await pool.query(`SELECT * FROM ${Lend.tableName};`);
        expect(res.rows.length).toBe(1);
        // expect(res.rows[0].name).toBe(lendData.name);
        expect(parseFloat(res.rows[0].quantity)).toBe(lendData.quantity);
    });

});

describe('update', () => {

    it('when updating email and last_name by id, will succeed', async() => {
        
        // create data first
        const lend = await lendDAO.insert({
            toolId: tools[0].id,
            mechanicId: mechanics[1].id,
            quantity: 1,
            borrowedAt: new Date().toISOString(),
        });

        // console.log(manager.id);

        const newQuantity = 2;
        const newRemarks = 'all is Good';

        let err = null;
        try {
            const updated = await lendDAO.update(
                data={
                    quantity: newQuantity,
                    remarks: newRemarks, 
                },
                where={id: lend.id }
            );

            // console.log(updated);

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();

        // assert values updated
        const savedLend = await pool.query(`SELECT * FROM ${Lend.tableName};`);
        expect(savedLend.rows.length).toBe(1);
        expect(savedLend.rows[0].id).toBe(lend.id);
        expect(parseInt(savedLend.rows[0].quantity)).toBe(newQuantity);
        expect(savedLend.rows[0].remarks).toBe(newRemarks);

    });


});

describe('find', () => {

    it('when finding by available 20 on records, will succeed', async() => {
        /// create lends first
        const lendData = [
            {
                toolId: tools[0].id,
                mechanicId: mechanics[0].id,
                quantity: 2,
                borrowedAt: new Date().toISOString(),
            },
            {
                toolId: tools[1].id,
                mechanicId: mechanics[1].id,
                quantity: 3,
                borrowedAt: new Date().toISOString(),
            },
            {
                toolId: tools[2].id,
                mechanicId: mechanics[2].id,
                quantity: 4,
                borrowedAt: new Date().toISOString(),
            },
        ]

        for (const data of lendData) {
            const c = await lendDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await lendDAO.find( 
                where= { quantity: 3 } 
            );

            expect(search1.length).toBe(1);


            const search2 = await lendDAO.find( 
                where= { quantity: 4 } 
            );

            expect(search2.length).toBe(1);
            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with limit, will succeed', async() => {

        /// create lends first
        const lendData = [
            {
                toolId: tools[0].id,
                mechanicId: mechanics[0].id,
                quantity: 2,
                borrowedAt: new Date().toISOString(),
            },
            {
                toolId: tools[1].id,
                mechanicId: mechanics[1].id,
                quantity: 3,
                borrowedAt: new Date().toISOString(),
            },
            {
                toolId: tools[2].id,
                mechanicId: mechanics[2].id,
                quantity: 4,
                borrowedAt: new Date().toISOString(),
            },
        ]

        for (const data of lendData) {
            const c = await lendDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await lendDAO.find( 
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

        /// create lends first
        const lendData = [
            {
                toolId: tools[0].id,
                mechanicId: mechanics[0].id,
                quantity: 2,
                borrowedAt: new Date().toISOString(),
            },
            {
                toolId: tools[1].id,
                mechanicId: mechanics[1].id,
                quantity: 3,
                borrowedAt: new Date().toISOString(),
            },
            {
                toolId: tools[2].id,
                mechanicId: mechanics[2].id,
                quantity: 4,
                borrowedAt: new Date().toISOString(),
            },
        ]

        for (const data of lendData) {
            const c = await lendDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await lendDAO.find( 
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

        /// create lends first
        const lendData = [
            {
                toolId: tools[0].id,
                mechanicId: mechanics[0].id,
                quantity: 2,
                borrowedAt: new Date().toISOString(),
            },
            {
                toolId: tools[1].id,
                mechanicId: mechanics[1].id,
                quantity: 3,
                borrowedAt: new Date().toISOString(),
            },
            {
                toolId: tools[2].id,
                mechanicId: mechanics[2].id,
                quantity: 4,
                borrowedAt: new Date().toISOString(),
            },
        ]

        for (const data of lendData) {
            const c = await lendDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await lendDAO.find( 
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



