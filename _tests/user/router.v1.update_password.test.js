const request = require('supertest');
const bcrypt = require('bcryptjs');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const userMigration1 = require('../../db_migrations/1647518448506_add_company_details_on_users_table');
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
    await userMigration0.down();
    // migrate tables
    await userMigration0.up();
    await userMigration1.up();
});

beforeEach( async () => {
    await pool.query(`DELETE FROM ${User.tableName};`);      
});

afterAll( async () => {
    await userMigration0.down();
    await closePool();
});


it('when updating password with correct data, will succeed', async() => {

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
        currentPassword: adminData.password,
        password: 'newP@ssw0rd'
    }
    
    const response = await request(app)
        .post(`/${v}/update-password`)
        .set('Authorization', `Bearer ${loginRes.body.authToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.email).toBe(adminData.email);
    expect(response.body.data.mobile).toBe(adminData.mobile);
    expect(response.body.data.firstName).toBe(adminData.firstName);
    expect(response.body.data.lastName).toBe(adminData.lastName);
    expect(response.body.data.gender).toBe(adminData.gender);

    const newLoginRes = await request(app)
        .post(`/${v}/login`)
        .send({
            email: adminData.email,
            password: newData.password,
        });

    // console.dir(newLoginRes.body, { depth: null });

    expect(newLoginRes.status).toBe(200);

});

it('when updating password with wrong currentPassword, will fail', async() => {

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
        currentPassword: 'notTheP@ssw0rd',
        password: 'newP@ssw0rd'
    }
    
    const response = await request(app)
        .post(`/${v}/update-password`)
        .set('Authorization', `Bearer ${loginRes.body.authToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

  

});