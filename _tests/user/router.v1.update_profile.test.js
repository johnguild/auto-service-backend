const request = require('supertest');
const bcrypt = require('bcryptjs');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const { app } = require('../../app');
const v = 'v1';

const adminData = {
    email: 'johnrobin.autoservice@gmail.com',
    mobile: '639359372676',
    password: 'P@ssW0rd',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_ADMIN,
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


it('when updating basic info of existing user, will succeed', async() => {

    /// create user
    const adminEncryptedPass = await bcrypt.hash(adminData.password, parseInt(process.env.BCRYPT_SALT));
    const admin = await userDAO.insert(data = {
        ...adminData,
        password: adminEncryptedPass,
    });  

    /// login user
    const loginRes = await request(app)
        .post(`/${v}/login`)
        .send({
            email: admin.email,
            password: adminData.password,
        });

    // console.dir(loginRes.body, { depth: null });

    const newData = {
        email: 'newemail@autoservice.com',
        mobile: '09368031457',
        firstName: 'Machi',
        lastName: 'Perez',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Female',
    }
    
    const response = await request(app)
        .post(`/${v}/update-profile`)
        .set('Authorization', `Bearer ${loginRes.body.authToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.email).toBe(newData.email);
    expect(response.body.data.mobile).toBe(newData.mobile);
    expect(response.body.data.firstName).toBe(newData.firstName);
    expect(response.body.data.lastName).toBe(newData.lastName);
    expect(response.body.data.gender).toBe(newData.gender);

});

it('when updating basic info with duplicate email, will fail', async() => {


    /// create user
    const adminEncryptedPass = await bcrypt.hash(adminData.password, parseInt(process.env.BCRYPT_SALT));
    const admin = await userDAO.insert(data = {
        ...adminData,
        password: adminEncryptedPass,
    });  


    /// create user
    const dummyData = {
        email: 'testautoservice@gmail.com',
        mobile: '0912312412',
        password: 'P@ssW0rd',
        firstName: 'Hoshi',
        lastName: 'Chiyo',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Male',
        role: User.ROLE_ADMIN,
    }
    const dummyEncryptedPass = await bcrypt.hash(dummyData.password, parseInt(process.env.BCRYPT_SALT));
    const dummy = await userDAO.insert(data = {
        ...dummyData,
        password: dummyEncryptedPass,
    });  

    /// login user
    const loginRes = await request(app)
        .post(`/${v}/login`)
        .send({
            email: admin.email,
            password: adminData.password,
        });

    // console.dir(loginRes.body, { depth: null });

    const newData = {
        email: dummy.email,
        mobile: '09368031457',
        firstName: 'Machi',
        lastName: 'Perez',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Female',
    }
    
    const response = await request(app)
        .post(`/${v}/update-profile`)
        .set('Authorization', `Bearer ${loginRes.body.authToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when updating basic info with new password, will succeed', async() => {


    /// create user
    const adminEncryptedPass = await bcrypt.hash(adminData.password, parseInt(process.env.BCRYPT_SALT));
    const admin = await userDAO.insert(data = {
        ...adminData,
        password: adminEncryptedPass,
    });  

    /// login user
    const loginRes = await request(app)
        .post(`/${v}/login`)
        .send({
            email: admin.email,
            password: adminData.password,
        });

    // console.dir(loginRes.body, { depth: null });

    const newData = {
        mobile: '09368031457',
        firstName: 'Machi',
        lastName: 'Perez',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Female',
        password: 'test1234'
    }
    
    const response = await request(app)
        .post(`/${v}/update-profile`)
        .set('Authorization', `Bearer ${loginRes.body.authToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);


    const newLoginRes = await request(app)
        .post(`/${v}/login`)
        .send({
            email: admin.email,
            password: newData.password,
        });

    // console.dir(newLoginRes.body, { depth: null });

    expect(newLoginRes.status).toBe(200);

});