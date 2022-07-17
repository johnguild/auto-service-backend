const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const lendDAO = require('../../lend/lend.dao');
const Lend = require('../../lend/lend.model');

const Mechanic = require('../../mechanic/mechanic.model');
const mechanicDAO = require('../../mechanic/mechanic.dao');

const Tool = require('../../tool/tool.model');
const toolDAO = require('../../tool/tool.dao');

const { app } = require('../../app');
const v = 'v1';

const clerkData = {
    email: 'johnrobin.autolend@gmail.com',
    mobile: '639359372676',
    password: 'P@ssW0rd',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_CLERK,
}

let clerkToken;
const tools = [], mechanics = [];


beforeAll( async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await migrate.down();
    // migrate tables
    await migrate.up();

    const clerkEncryptedPass = await bcrypt.hash(clerkData.password, parseInt(process.env.BCRYPT_SALT));
    const clerk = await userDAO.insert(data = {
        ...clerkData,
        password: clerkEncryptedPass,
    });     
    
    clerkToken = tokenator.generate({ userId: clerk.id });

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

beforeEach( async () => {
    await pool.query(`
        DELETE FROM ${Lend.tableName};
    `);

});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    const lendData = {
        toolId: tools[0].id,
        mechanicId: mechanics[0].id,
        quantity: 1,
    }

    const response = await request(app)
        .post(`/${v}/lends`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(lendData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with invalid quantity data, will fail', async() => {

    const lendData = {
        toolId: tools[0].id,
        mechanicId: mechanics[0].id,
        quantity: -1,
    }


    const response = await request(app)
        .post(`/${v}/lends`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(lendData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when with tool does not exists, will fail', async() => {

    const lendData = {
        toolId: mechanics[1].id,// use mechanic to error
        mechanicId: mechanics[0].id,
        quantity: 1,
    }


    const response = await request(app)
        .post(`/${v}/lends`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(lendData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when with tool quantity is not enough not exists, will fail', async() => {

    const lendData = {
        toolId: tools[0].id,// use mechanic to error
        mechanicId: mechanics[0].id,
        quantity: parseInt(tools[0].quantity) + 1,
    }

    // console.log(tools[0]);

    const response = await request(app)
        .post(`/${v}/lends`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(lendData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when with mechanic does not exists, will fail', async() => {

    const lendData = {
        toolId: tools[0].id,
        mechanicId: tools[1].id,// use tool to error
        quantity: 1,
    }


    const response = await request(app)
        .post(`/${v}/lends`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(lendData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when with valid data but using customer account, will succeed', async() => {

    /// create customer first
    const customerData = {
        email: 'mup.autolend@gmail.com',
        password: 'P@ssW0rd',
        firstName: 'Muphy',
        lastName: 'Tayag',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Female',
        role: User.ROLE_CUSTOMER,
    }
    const customerEncryptedPass = await bcrypt.hash(customerData.password, parseInt(process.env.BCRYPT_SALT));
    const customer = await userDAO.insert(data = {
        ...customerData,
        password: customerEncryptedPass,
    });  

    /// create token
    const token = tokenator.generate({ userId: customer.id });
 

    const lendData = {
        toolId: tools[0].id,
        mechanicId: mechanics[0].id,
        quantity: 1,
    }

    const response = await request(app)
        .post(`/${v}/lends`)
        .set('Authorization', `Bearer ${token}`)
        .send(lendData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);
    // expect(response.body.data).not.toBeNull();

});
