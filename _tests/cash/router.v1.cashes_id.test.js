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

let managerId;
let managerToken;


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
    const manager = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });     
    
    managerId = manager.id;
    managerToken = tokenator.generate({ userId: manager.id });
});

beforeEach( async () => {
    await pool.query(`DELETE FROM ${Cash.tableName};`);
    await pool.query(`DELETE FROM ${Usage.tableName};`);
});

afterAll( async () => {
    await userMigration0.down();
    await cashMigration0.down();
    await usageMigration0.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    /// create personal
    const cashData = {
        amount: 1000,
        purpose: 'Test'
    }
    const cash = await cashDAO.insert(cashData);

    // console.log(cash);

    const newData = {
        amount: 200,
        purpose: 'Test e'
    }

    const response = await request(app)
        .post(`/${v}/cashes/${cash.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.amount).toBe(newData.amount.toString());
    expect(response.body.data.purpose).toBe(newData.purpose);

});



it('when usage already added, will fail', async() => {

    /// create personal
    const cashData = {
        amount: 1000,
        purpose: 'Test'
    }
    const cash = await cashDAO.insert(cashData);

    // console.log(cash);

    await usageDAO.insert({
        amount: 300,
        cashId: cash.id,
        purpose: 'Hello',
    });

    const newData = {
        amount: 200,
        purpose: 'Test'
    }

    const response = await request(app)
        .post(`/${v}/cashes/${cash.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when with non existing cash id data, will fail', async() => {
    /// use manager id instead
    const response = await request(app)
        .post(`/${v}/cashes/${managerId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
            amount: 3000,
            purpose: 'Test'
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(404);


});


it('when with invalid uuid data, will fail', async() => {

    const response = await request(app)
        .post(`/${v}/cashes/notauuid`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ amount: 3000 });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});



