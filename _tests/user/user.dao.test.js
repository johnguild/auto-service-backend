const jwt = require('jsonwebtoken');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
// const loginTokenMigration0 = require('../../_migrations/1619068404056_create_login_tokens_table');

// const LoginToken = require('../../login_tokens/models/login_token.model');

const User = require('../../user/user.model');
const userDAO = require('../../user/user.dao');

const managerData = {
    email: 'johnrobin.autoservice@gmail.com',
    mobile: '639359372676',
    password: 'password',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_MANAGER,
}



beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await userMigration0.down();
    // migrate tables
    await userMigration0.up();
    // await loginTokenMigration0.down().then(() => loginTokenMigration0.up());
    // await companyMigration0.down().then(() => companyMigration0.up());
});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${User.tableName};`);
    // await pool.query(`DELETE FROM ${LoginToken.tableName};`);
    // await pool.query(`DELETE FROM ${Company.tableName};`);
});

afterAll( async() => {
    await userMigration0.down();
    // await loginTokenMigration0.down();
    // await companyMigration0.down();
    await closePool();
});


describe('create', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        let err = null;
        try {
            await userDAO.insert(managerData);

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert user saved
        const res = await pool.query(`SELECT * FROM ${User.tableName};`);
        expect(res.rows.length).toBe(1);
        expect(res.rows[0].email).toBe(managerData.email);
        expect(res.rows[0].mobile).toBe(managerData.mobile);
        expect(res.rows[0].password).toBe(managerData.password);
        expect(res.rows[0].first_name).toBe(managerData.firstName);
        expect(res.rows[0].last_name).toBe(managerData.lastName);
        // date changes because we assign it to DATE without time
        // expect(res.rows[0].birth_day).toBe(managerData.birthDay);
        expect(res.rows[0].gender).toBe(managerData.gender);
        expect(res.rows[0].role).toBe(managerData.role);
    });

    it('when creating with valid but without mobile, will succeed', async() => {

        
        let err = null;
        try {
            await userDAO.insert({
                ...managerData,
                mobile: undefined
            });

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert user saved
        const res = await pool.query(`SELECT * FROM ${User.tableName};`);
        expect(res.rows.length).toBe(1);
        expect(res.rows[0].email).toBe(managerData.email);
        expect(res.rows[0].password).toBe(managerData.password);
        expect(res.rows[0].first_name).toBe(managerData.firstName);
        expect(res.rows[0].last_name).toBe(managerData.lastName);
        // date changes because we assign it to DATE without time
        // expect(res.rows[0].birth_day).toBe(managerData.birthDay);
        expect(res.rows[0].gender).toBe(managerData.gender);
        expect(res.rows[0].mobile).not.toBe(managerData.mobile);
        expect(res.rows[0].role).toBe(managerData.role);
    });

});

describe('update', () => {

    it('when updating email and last_name by id, will succeed', async() => {
        // create data first
        const manager = await userDAO.insert(managerData);

        // console.log(manager.id);

        const newEmail = 'johnguild26@gmail.com';
        const newLastName = 'Garcia';

        let err = null;
        try {
            const updated = await userDAO.update(
                data={email: newEmail, lastName: newLastName},
                where={id: manager.id }
            );

            // console.log(updated);

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();

        // assert values updated
        const savedUser = await pool.query(`SELECT * FROM ${User.tableName};`);
        expect(savedUser.rows.length).toBe(1);
        expect(savedUser.rows[0].id).toBe(manager.id);
        expect(savedUser.rows[0].email).toBe(newEmail);
        expect(savedUser.rows[0].last_name).toBe(newLastName);

    });

    it('when updating first_name and last_name by id and email, will succeed', async() => {
        // create data first
        const manager = await userDAO.insert(managerData);

        // console.log(manager.id);

        const newFirstName = 'Robin';
        const newLastName = 'Garcia';

        let err = null;
        try {
            await userDAO.update(
                data={firstName: newFirstName, lastName: newLastName},
                where={id: manager.id, email: manager.email}
            );

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();

        // assert values updated
        const savedUser = await pool.query(`SELECT * FROM ${User.tableName};`);
        expect(savedUser.rows.length).toBe(1);
        expect(savedUser.rows[0].id).toBe(manager.id);
        expect(savedUser.rows[0].first_name).toBe(newFirstName);
        expect(savedUser.rows[0].last_name).toBe(newLastName);

    });


});

describe('search', () => {

    it('when finding by email on records, will succeed', async() => {
        /// create users first
        const manager = await userDAO.insert(managerData);

        const customerData = [
            {
                email: 'hoshi.autoservice@gmail.com',
                mobile: '639359372677',
                password: 'password',
                firstName: 'Hoshi',
                lastName: 'Persian',
                birthDay: new Date(Date.now()).toISOString(),
                gender: 'Male',
                role: User.ROLE_CUSTOMER,
            },
            {
                email: 'chiyo.autoservice@gmail.com',
                mobile: '639359372678',
                password: 'password',
                firstName: 'Chiyo',
                lastName: 'Himalayan',
                birthDay: new Date(Date.now()).toISOString(),
                gender: 'Male',
                role: User.ROLE_CUSTOMER,
            },
        ]

        for (const data of customerData) {
            const c = await userDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await userDAO.find( 
                where= {email: managerData.email } 
            );

            expect(search1.length).toBe(1);
            expect(search1[0].id).toBe(manager.id);


            const search2 = await userDAO.find( 
                where= {email: customerData[1].email } 
            );

            expect(search2.length).toBe(1);
            expect(search2[0].firstName).toBe(customerData[1].firstName);
            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with limit, will succeed', async() => {

        /// create users first
        const manager = await userDAO.insert(managerData);

        const customerData = [
            {
                email: 'muphy.autoservice@gmail.com',
                mobile: '639359372680',
                password: 'password',
                firstName: 'Mup',
                lastName: 'Ta',
                birthDay: new Date(Date.now()).toISOString(),
                gender: 'Female',
                role: User.ROLE_CUSTOMER,
            },
            {
                email: 'hoshi.autoservice@gmail.com',
                mobile: '639359372677',
                password: 'password',
                firstName: 'Hoshi',
                lastName: 'Persian',
                birthDay: new Date(Date.now()).toISOString(),
                gender: 'Male',
                role: User.ROLE_CUSTOMER,
            },
            {
                email: 'chiyo.autoservice@gmail.com',
                mobile: '639359372678',
                password: 'password',
                firstName: 'Chiyo',
                lastName: 'Himalayan',
                birthDay: new Date(Date.now()).toISOString(),
                gender: 'Male',
                role: User.ROLE_CUSTOMER,
            },
        ]

        for (const data of customerData) {
            const c = await userDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await userDAO.find( 
                where= {role: User.ROLE_CUSTOMER},
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

        /// create users first
        const manager = await userDAO.insert(managerData);

        const customerData = [
            {
                email: 'muphy.autoservice@gmail.com',
                mobile: '639359372680',
                password: 'password',
                firstName: 'Mup',
                lastName: 'Ta',
                birthDay: new Date(Date.now()).toISOString(),
                gender: 'Female',
                role: User.ROLE_CUSTOMER,
            },
            {
                email: 'hoshi.autoservice@gmail.com',
                mobile: '639359372677',
                password: 'password',
                firstName: 'Hoshi',
                lastName: 'Persian',
                birthDay: new Date(Date.now()).toISOString(),
                gender: 'Male',
                role: User.ROLE_CUSTOMER,
            },
            {
                email: 'chiyo.autoservice@gmail.com',
                mobile: '639359372678',
                password: 'password',
                firstName: 'Chiyo',
                lastName: 'Himalayan',
                birthDay: new Date(Date.now()).toISOString(),
                gender: 'Male',
                role: User.ROLE_CUSTOMER,
            },
        ]

        for (const data of customerData) {
            const c = await userDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await userDAO.find( 
                where= {role: User.ROLE_CUSTOMER},
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

        /// create users first
        const manager = await userDAO.insert(managerData);

        const customerData = [
            {
                email: 'muphy.autoservice@gmail.com',
                mobile: '639359372680',
                password: 'password',
                firstName: 'Mup',
                lastName: 'Ta',
                birthDay: new Date(Date.now()).toISOString(),
                gender: 'Female',
                role: User.ROLE_CUSTOMER,
            },
            {
                email: 'hoshi.autoservice@gmail.com',
                mobile: '639359372677',
                password: 'password',
                firstName: 'Hoshi',
                lastName: 'Persian',
                birthDay: new Date(Date.now()).toISOString(),
                gender: 'Male',
                role: User.ROLE_CUSTOMER,
            },
            {
                email: 'chiyo.autoservice@gmail.com',
                mobile: '639359372678',
                password: 'password',
                firstName: 'Chiyo',
                lastName: 'Himalayan',
                birthDay: new Date(Date.now()).toISOString(),
                gender: 'Male',
                role: User.ROLE_CUSTOMER,
            },
        ]

        for (const data of customerData) {
            const c = await userDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await userDAO.find( 
                where= {role: User.ROLE_CUSTOMER},
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



