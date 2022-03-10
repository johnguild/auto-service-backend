const jwt = require('jsonwebtoken');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const mechanicMigration0 = require('../../db_migrations/1644727593949_create_mechanics_table');

const Mechanic = require('../../mechanic/mechanic.model');
const mechanicDAO = require('../../mechanic/mechanic.dao');

const mechanicData = {
    mobile: '639359372676',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
}



beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await mechanicMigration0.down();
    // migrate tables
    await mechanicMigration0.up();
});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Mechanic.tableName};`);
});

afterAll( async() => {
    await mechanicMigration0.down();
    await closePool();
});


describe('insert', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        let err = null;
        try {
            await mechanicDAO.insert(mechanicData);

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert mechanic saved
        const res = await pool.query(`SELECT * FROM ${Mechanic.tableName};`);
        expect(res.rows.length).toBe(1);
        expect(res.rows[0].mobile).toBe(mechanicData.mobile);
        expect(res.rows[0].first_name).toBe(mechanicData.firstName);
        expect(res.rows[0].last_name).toBe(mechanicData.lastName);
        // date changes because we assign it to DATE without time
        expect(new Date(res.rows[0].birth_day).toISOString()).toBe(mechanicData.birthDay);
        expect(res.rows[0].gender).toBe(mechanicData.gender);
    });

    it('when creating with valid but without mobile, will succeed', async() => {

        
        let err = null;
        try {
            await mechanicDAO.insert({
                ...mechanicData,
                mobile: undefined
            });

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert mechanic saved
        const res = await pool.query(`SELECT * FROM ${Mechanic.tableName};`);
        expect(res.rows.length).toBe(1);
        expect(res.rows[0].mobile).toBeNull();
        expect(res.rows[0].first_name).toBe(mechanicData.firstName);
        expect(res.rows[0].last_name).toBe(mechanicData.lastName);
        // date changes because we assign it to DATE without time
        expect(new Date(res.rows[0].birth_day).toISOString()).toBe(mechanicData.birthDay);
        expect(res.rows[0].gender).toBe(mechanicData.gender);
        expect(res.rows[0].mobile).not.toBe(mechanicData.mobile);
    });

});

describe('update', () => {

    it('when updating first_name and last_name by id and email, will succeed', async() => {
        // create data first
        const mechanic = await mechanicDAO.insert(mechanicData);

        // console.log(mechanic.id);

        const newFirstName = 'Robin';
        const newLastName = 'Garcia';

        let err = null;
        try {
            await mechanicDAO.update(
                data={firstName: newFirstName, lastName: newLastName},
                where={id: mechanic.id, email: mechanic.email}
            );

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();

        // assert values updated
        const savedMechanic = await pool.query(`SELECT * FROM ${Mechanic.tableName};`);
        expect(savedMechanic.rows.length).toBe(1);
        expect(savedMechanic.rows[0].id).toBe(mechanic.id);
        expect(savedMechanic.rows[0].first_name).toBe(newFirstName);
        expect(savedMechanic.rows[0].last_name).toBe(newLastName);

    });


});

describe('find', () => {

    it('when finding by mobile on records, will succeed', async() => {
        /// create mechanics first
        const mechanic = await mechanicDAO.insert(mechanicData);

        const customerData = [
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
        ]

        for (const data of customerData) {
            const c = await mechanicDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await mechanicDAO.find( 
                where= {mobile: mechanicData.mobile } 
            );

            expect(search1.length).toBe(1);
            expect(search1[0].id).toBe(mechanic.id);


            const search2 = await mechanicDAO.find( 
                where= {mobile: customerData[1].mobile } 
            );

            expect(search2.length).toBe(1);
            expect(search2[0].firstName).toBe(customerData[1].firstName);
            expect(search2[0].mobile).toBe(customerData[1].mobile);
            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with limit, will succeed', async() => {

        /// create mechanics first
        const mechanic = await mechanicDAO.insert(mechanicData);

        const customerData = [
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
        ]

        for (const data of customerData) {
            const c = await mechanicDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await mechanicDAO.find( 
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

        /// create mechanics first
        const mechanic = await mechanicDAO.insert(mechanicData);

        const customerData = [
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
        ]

        for (const data of customerData) {
            const c = await mechanicDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await mechanicDAO.find( 
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

        /// create mechanics first
        const mechanic = await mechanicDAO.insert(mechanicData);

        const customerData = [
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
        ]

        for (const data of customerData) {
            const c = await mechanicDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await mechanicDAO.find( 
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



