const request = require('supertest');
const bcrypt = require('bcryptjs');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
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

beforeAll( async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await userMigration0.down();
    // migrate tables
    await userMigration0.up();
});

beforeEach( async () => {
    await pool.query(`DELETE FROM ${User.tableName};`);

    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });        
});

afterAll( async () => {
    await userMigration0.down();
    await closePool();
});


it('when logging existing user, will succeed', async() => {

    const data = {
        email: managerData.email,
        password: managerData.password,
    }
    
    const response = await request(app)
        .post(`/${v}/login`)
        .send(data);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});


it('when logging disabled user, will fail', async() => {

    const customerData = {
        email: 'muphy.autoservice@gmail.com',
        mobile: '639359372677',
        password: 'P@ssW0rd',
        firstName: 'Muphy',
        lastName: 'Tayag',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Female',
        role: User.ROLE_MANAGER,
        isDisabled: true
    }
    const encryptedPass = await bcrypt.hash(customerData.password, parseInt(process.env.BCRYPT_SALT));
    await userDAO.insert(data = {
        ...customerData,
        password: encryptedPass,
    }); 


    const response = await request(app)
        .post(`/${v}/login`)
        .send({
            email: customerData.email,
            password: customerData.password,
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);
    // expect(response.body.data).not.toBeNull();

});


it('when logging wrong credentials, will succeed', async() => {

    const data = {
        email: 'nomadnotexists@gmail.com',
        password: 'P@ssW0rd',
    }

    const response = await request(app)
        .post(`/${v}/login`)
        .send(data);
    // console.log(response.body);

    expect(response.status).toBe(404);

});

it('when logging with no credentials, will succeed', async() => {

    const response = await request(app)
        .post(`/${v}/login`)
        .send();

    // console.log(response.body);

    expect(response.status).toBe(400);

});


