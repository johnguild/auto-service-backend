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
});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when getting data without page, will succeed', async() => {

    const cash = await cashDAO.insert({ amount: 100 });
    const usageData = [
        {
            cashId: cash.id,
            amount: 1200,
            purpose: "Test",
        },
        {
            cashId: cash.id,
            amount: 900,
            purpose: "Test",
        },
        {
            cashId: cash.id,
            amount: 2100,
            purpose: "Test",
        },
        {
            cashId: cash.id,
            amount: 1100,
            purpose: "Test",
        },
    ];

    for (const p of usageData) {
        await usageDAO.insert(p);
    }


    const cash2 = await cashDAO.insert({ amount: 300 });
    const usage2Data = [
        {
            cashId: cash2.id,
            amount: 1200,
            purpose: "Test",
        },
        {
            cashId: cash2.id,
            amount: 900,
            purpose: "Test",
        },
        {
            cashId: cash2.id,
            amount: 2100,
            purpose: "Test",
        },
        {
            cashId: cash2.id,
            amount: 1100,
            purpose: "Test",
        },
    ];

    for (const p of usage2Data) {
        await usageDAO.insert(p);
    }

    const response = await request(app)
        .get(`/${v}/usages-all`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(usageData.length + usage2Data.length);

});

