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
});

afterAll( async () => {
    await userMigration0.down();
    await closePool();
});


it('when getting details of existing user, will succeed', async() => {

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


