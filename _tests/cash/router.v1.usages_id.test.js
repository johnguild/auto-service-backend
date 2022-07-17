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

    /// create personal
    const cash = await cashDAO.insert({
        amount: 300,
    });
    const usage = await usageDAO.insert({
        cashId: cash.id,
        amount: 700,
        purpose: 'Nothing',
    });

    // console.log(cash);

    const newData = {
        amount: 805.25,
        purpose: 'Some purpose',
    }

    const response = await request(app)
        .post(`/${v}/usages/${usage.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.amount).toBe(newData.amount.toString());
    expect(response.body.data.purpose).toBe(newData.purpose);

    const res = await pool.query(`SELECT * FROM ${Cash.tableName};`);
    expect(res.rows.length).toBe(1);
    expect(parseFloat(res.rows[0].amount)).toBe((parseFloat(cash.amount) + parseFloat(usage.amount)) - newData.amount);

});



it('when usage cash amount is not enough, will fail', async() => {

   
    /// create personal
    const cash = await cashDAO.insert({
        amount: 300,
    });
    const usage = await usageDAO.insert({
        cashId: cash.id,
        amount: 700,
        purpose: 'Nothing',
    });

    // console.log(cash);

    const newData = {
        amount: 1200.25,
        purpose: 'Some purpose',
    }

    const response = await request(app)
        .post(`/${v}/usages/${usage.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});



