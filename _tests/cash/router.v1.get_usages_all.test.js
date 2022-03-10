const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const cashMigration0 = require('../../db_migrations/1646914540177_create_cashes_table');
const cashDAO = require('../../cash/cash.dao');
const Cash = require('../../cash/cash.model');

const usageMigration0 = require('../../db_migrations/1646915737379_create_usages_table');
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
    await userMigration0.down();
    await cashMigration0.down();
    await usageMigration0.down();
    // migrate tables
    await userMigration0.up();
    await cashMigration0.up();
    await usageMigration0.up();

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
    await userMigration0.down();
    await cashMigration0.down();
    await usageMigration0.down();
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

