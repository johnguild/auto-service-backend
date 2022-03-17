const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const userMigration1 = require('../../db_migrations/1647518448506_add_company_details_on_users_table');
const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

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
    await userMigration0.down();
    // migrate tables
    await userMigration0.up();
    await userMigration1.up();
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
    await userMigration0.down();
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
