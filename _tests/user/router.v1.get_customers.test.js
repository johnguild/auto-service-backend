const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const orderDAO = require('../../order/order.dao');

const { app } = require('../../app');
const v = 'v1';

const managerData = {
    email: 'johnrobin.autoservice@gmail.com',
    mobile: '639359372676',
    password: 'P@ssW0rd',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_MANAGER,
}

let managerToken;


beforeAll( async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await migrate.down();
    // migrate tables
    await migrate.up();
});

beforeEach( async () => {
    await pool.query(`DELETE FROM ${User.tableName};`);

    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    const manager = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });     
    
    managerToken = tokenator.generate({ userId: manager.id });
});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when getting data without page, will succeed', async() => {

    const customerData = [
        {
            email: 'person1.autoservice@gmail.com',
            mobile: '639359372676',
            password: 'P@ssW0rd',
            firstName: 'Customer',
            lastName: 'One',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Male',
            role: User.ROLE_CUSTOMER,
        },
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
    ];

    for (const p of customerData) {
        await userDAO.insert(p);
    }


    const response = await request(app)
        .get(`/${v}/customers`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(customerData.length);

});

it('when getting data with plateKeyword, will succeed', async() => {

    const customerData = [
        {
            email: 'person1.autoservice@gmail.com',
            mobile: '639359372676',
            password: 'P@ssW0rd',
            firstName: 'Customer',
            lastName: 'One',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Male',
            role: User.ROLE_CUSTOMER,
        },
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
    ];

    for (const p of customerData) {
        const customer = await userDAO.insert(p);

        // add order to first customer
        if (p.email == customerData[0].email) {
            await orderDAO.insertOrder({
                customerId: customer.id,
                carMake: 'Toyota',
                carType: '2020 Camry',
                carYear: '2000',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                receiveDate: new Date().toISOString(),
                warrantyEnd: new Date().toISOString(),
            })
        } else if (p.email == customerData[1].email) {
            await orderDAO.insertOrder({
                customerId: customer.id,
                carMake: 'Toyota',
                carType: '2020 Camry',
                carYear: '2000',
                carPlate: 'XWZWS',
                carOdometer: '6700',
                receiveDate: new Date().toISOString(),
                warrantyEnd: new Date().toISOString(),
            })
        }
    }


    const response = await request(app)
        .get(`/${v}/customers`)
        .set('Authorization', `Bearer ${managerToken}`)
        .query({
            plateKeyword: 'bcd'
        })
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(1);

});


it('when getting data without page and limit, will succeed', async() => {

    const customerData = [
        {
            email: 'person1.autoservice@gmail.com',
            mobile: '639359372676',
            password: 'P@ssW0rd',
            firstName: 'Customer',
            lastName: 'One',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Male',
            role: User.ROLE_CUSTOMER,
        },
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
    ];

    for (const p of customerData) {
        await userDAO.insert(p);
    }

    const queryParams = {
        page: 2,
        limit: 1,
    }

    const response = await request(app)
        .get(`/${v}/customers`)
        .set('Authorization', `Bearer ${managerToken}`)
        .query(queryParams)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(queryParams.limit);

});
