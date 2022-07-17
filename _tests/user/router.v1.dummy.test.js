const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

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


const customerData = {
    email: 'mup.autoservice@gmail.com',
    password: 'P@ssW0rd',
    firstName: 'Muphy',
    lastName: 'Tayag',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Female',
    role: User.ROLE_CUSTOMER,
}

beforeAll( async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await migrate.down();
    // migrate tables
    await migrate.up();
});

beforeEach( async () => {
    await pool.query(`DELETE FROM ${User.tableName};`);      
});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('fetching api for manager by manager acc, will succeed', async() => {

    /// create user
    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    const manager = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });  

    /// login user
    const loginRes = await request(app)
        .post(`/${v}/login`)
        .send({
            email: manager.email,
            password: managerData.password,
        });

    // console.dir(loginRes.body, { depth: null });
    
    const response = await request(app)
        .get(`/${v}/me`)
        .set('Authorization', `Bearer ${loginRes.body.authToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('fetching api for manager by customer acc, will fail', async() => {

    /// create user
    const customerEncryptedPass = await bcrypt.hash(customerData.password, parseInt(process.env.BCRYPT_SALT));
    const customer = await userDAO.insert(data = {
        ...customerData,
        password: customerEncryptedPass,
    });  

    /// login user
    const loginRes = await request(app)
        .post(`/${v}/login`)
        .send({
            email: customer.email,
            password: customerData.password,
        });

    // console.dir(loginRes.body, { depth: null });
    
    const response = await request(app)
        .get(`/${v}/manager`)
        .set('Authorization', `Bearer ${loginRes.body.authToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);

});

it('fetching api for customer by customer acc, will succeed', async() => {

    /// create user
    const customerEncryptedPass = await bcrypt.hash(customerData.password, parseInt(process.env.BCRYPT_SALT));
    const customer = await userDAO.insert(data = {
        ...customerData,
        password: customerEncryptedPass,
    });  

    /// login user
    const loginRes = await request(app)
        .post(`/${v}/login`)
        .send({
            email: customer.email,
            password: customerData.password,
        });

    // console.dir(loginRes.body, { depth: null });
    
    const response = await request(app)
        .get(`/${v}/customer`)
        .set('Authorization', `Bearer ${loginRes.body.authToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('fetching api for customer by manager acc, will fail', async() => {

    /// create user
    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    const manager = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });  

    /// login user
    const loginRes = await request(app)
        .post(`/${v}/login`)
        .send({
            email: manager.email,
            password: managerData.password,
        });

    // console.dir(loginRes.body, { depth: null });
    
    const response = await request(app)
        .get(`/${v}/customer`)
        .set('Authorization', `Bearer ${loginRes.body.authToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);

});

it('fetching api for manager/customer by manager acc, will succeed', async() => {

    /// create user
    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    const manager = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });  

    /// login user
    const loginRes = await request(app)
        .post(`/${v}/login`)
        .send({
            email: manager.email,
            password: managerData.password,
        });

    // console.dir(loginRes.body, { depth: null });
    
    const response = await request(app)
        .get(`/${v}/manager-customer`)
        .set('Authorization', `Bearer ${loginRes.body.authToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);

});

it('fetching api for manager/customer by customer acc, will succeed', async() => {

    /// create user
    const customerEncryptedPass = await bcrypt.hash(customerData.password, parseInt(process.env.BCRYPT_SALT));
    const customer = await userDAO.insert(data = {
        ...customerData,
        password: customerEncryptedPass,
    });  

    /// login user
    const loginRes = await request(app)
        .post(`/${v}/login`)
        .send({
            email: customer.email,
            password: customerData.password,
        });

    // console.dir(loginRes.body, { depth: null });
    
    const response = await request(app)
        .get(`/${v}/manager-customer`)
        .set('Authorization', `Bearer ${loginRes.body.authToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);

});

it('fetching api for customer by disabled customer acc, will fail', async() => {

    /// create user
    const customerEncryptedPass = await bcrypt.hash(customerData.password, parseInt(process.env.BCRYPT_SALT));
    const customer = await userDAO.insert(data = {
        ...customerData,
        password: customerEncryptedPass,
        isDisabled: true,
    });  

    // manually create token
    const token = tokenator.generate({
        userId: customer.id,
    });

    // console.dir(loginRes.body, { depth: null });
    
    const response = await request(app)
        .get(`/${v}/customer`)
        .set('Authorization', `Bearer ${token}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(401);

});
