const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const cashDAO = require('../../cash/cash.dao');
const Cash = require('../../cash/cash.model');

const usageDAO = require('../../cash/usage.dao');
const Usage = require('../../cash/usage.model');

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

let managerToken, manager;


beforeAll( async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await migrate.down();
    // migrate tables
    await migrate.up();
    
    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    manager = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });     
    
    managerToken = tokenator.generate({ userId: manager.id });
});

beforeEach( async () => {
    await pool.query(`DELETE FROM ${Cash.tableName};`);
    await pool.query(`DELETE FROM ${Usage.tableName};`);

});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    const cash = await cashDAO.insert({amount: 1000});
    const usageData = {
        cashId: cash.id,
        amount: 300,
        purpose: 'Nothing',
    }

    const response = await request(app)
        .post(`/${v}/usages`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(usageData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.amount).toBe(usageData.amount.toString());
    expect(response.body.data.purpose).toBe(usageData.purpose);

    const res = await pool.query(`SELECT * FROM ${Cash.tableName};`);
    expect(res.rows.length).toBe(1);
    expect(parseFloat(res.rows[0].amount)).toBe((cash.amount - usageData.amount));

});


it('when with invalid amount data, will fail', async() => {

    const cash = await cashDAO.insert({amount: 1000});
    const usageData = {
        cashId: cash.id,
        amount: 'Hello123123',
        purpose: 'Nothing',
    }

    const response = await request(app)
        .post(`/${v}/usages`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(usageData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});



it('when with cashId does not exists, will fail', async() => {

    // const cash = await cashDAO.insert({amount: 1000});
    const usageData = {
        cashId: manager.id,
        amount: 'Hello123123',
        purpose: 'Nothing',
    }

    const response = await request(app)
        .post(`/${v}/usages`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(usageData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});



it('when with amount is greater than cash amount, will fail', async() => {

    const cash = await cashDAO.insert({amount: 500});
    const usageData = {
        cashId: cash.id,
        amount: 1214,
        purpose: 'Nothing',
    }

    const response = await request(app)
        .post(`/${v}/usages`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(usageData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});


