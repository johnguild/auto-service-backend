const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const lendMigration0 = require('../../db_migrations/1650029430483_create_lends_table');
const lendDAO = require('../../lend/lend.dao');
const Lend = require('../../lend/lend.model');

const mechanicMigration0 = require('../../db_migrations/1644727593949_create_mechanics_table');
const Mechanic = require('../../mechanic/mechanic.model');
const mechanicDAO = require('../../mechanic/mechanic.dao');

const toolMigration0 = require('../../db_migrations/1648809625370_create_tools_tables');
const Tool = require('../../tool/tool.model');
const toolDAO = require('../../tool/tool.dao');


const { app } = require('../../app');
const v = 'v1';

const clerkData = {
    email: 'johnrobin.autolend@gmail.com',
    mobile: '639359372676',
    password: 'P@ssW0rd',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_CLERK,
}

let clerkId, clerkToken;
const tools = [], mechanics = [];


beforeAll( async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await userMigration0.down();
    await lendMigration0.down();
    await mechanicMigration0.down();
    await toolMigration0.down();
    // migrate tables
    await userMigration0.up();
    await lendMigration0.up();
    await mechanicMigration0.up();
    await toolMigration0.up();

    const clerkEncryptedPass = await bcrypt.hash(clerkData.password, parseInt(process.env.BCRYPT_SALT));
    const clerk = await userDAO.insert(data = {
        ...clerkData,
        password: clerkEncryptedPass,
    });     
    
    clerkId = clerk.id;
    clerkToken = tokenator.generate({ userId: clerk.id });


    /// create tools
    for (const i of [
        {
            name: 'Repair Tool',
            description: 'Something here',
            cover: 'base64string here',
            quantity: 100,
            available: 100,
        },
        {
            name: 'Repair Tool 2',
            description: 'Something here',
            cover: 'base64string here',
            quantity: 99,
            available: 100,
        },
        {
            name: 'Repair Tool 3',
            description: 'Something here',
            cover: 'base64string here',
            quantity: 60,
            available: 100,
        },
    ]) {
        const res = await toolDAO.insert(i);
        tools.push(res);
    }

    /// create mechanics
    for (const i of [
        {
            mobile: '639359372680',
            firstName: 'Mup',
            lastName: 'Ta',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Female',
        },
        {
            mobile: '639359372677',
            firstName: 'Hoshi',
            lastName: 'Persian',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Male',
        },
        {
            mobile: '639359372678',
            firstName: 'Chiyo',
            lastName: 'Himalayan',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Male',
        },
    ]) {
        const res = await mechanicDAO.insert(i);
        mechanics.push(res);
    }
});

beforeEach( async () => {
    await pool.query(`
        DELETE FROM ${Lend.tableName};
    `);
});

afterAll( async () => {
    await userMigration0.down();
    await lendMigration0.down();
    await mechanicMigration0.down();
    await toolMigration0.down();
    await closePool();
});


it('when with valid data will succeed', async() => {

    const lendData = {
        toolId: tools[0].id,
        mechanicId: mechanics[0].id,
        quantity: 3
    }

    /// create lend
    const insertRes = await request(app)
        .post(`/${v}/lends`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(lendData);


    // console.log(personnel);

    const newData = {
        quantity: 10,
        remarks: 'all is good',
    }

    const response = await request(app)
        .post(`/${v}/lends/${insertRes.body.data.id}`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

    // assert values were updated
    const res = await pool.query(`SELECT * FROM ${Tool.tableName} WHERE id ='${tools[0].id}';`);
    expect(res.rows.length).toBe(1);
    expect(parseInt(res.rows[0].quantity)).toBe(parseInt(tools[0].quantity));
    expect(parseInt(res.rows[0].available)).toBe(parseInt(tools[0].quantity) - newData.quantity);


    const lRes = await pool.query(`SELECT * FROM ${Lend.tableName} WHERE id ='${insertRes.body.data.id}';`);
    expect(lRes.rows.length).toBe(1);
    expect(parseInt(lRes.rows[0].quantity)).toBe(newData.quantity);
    expect(lRes.rows[0].remarks).toBe(newData.remarks);

});

it('when with new quantity exceeds available will succeed', async() => {

    const lendData = {
        toolId: tools[0].id,
        mechanicId: mechanics[0].id,
        quantity: 3
    }

    /// create lend
    const insertRes = await request(app)
        .post(`/${v}/lends`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(lendData);


    // console.log(personnel);

    const newData = {
        quantity: 110,
    }

    const response = await request(app)
        .post(`/${v}/lends/${insertRes.body.data.id}`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);


});

it('when with non existing lend id data, will fail', async() => {

    const newData = {
        name: 'Repair Lend e',
        description: 'Something here e',
        cover: 'base64string',
        quantity: 300,
    }

    /// use clerk id instead
    const response = await request(app)
        .post(`/${v}/lends/${clerkId}`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(404);

});

it('when with invalid uuid data, will fail', async() => {

    const newData = {
        name: 'Repair Lend e',
        description: 'Something here e',
        cover: 'base64string',
        quantity: 300,
    }

    const response = await request(app)
        .post(`/${v}/lends/notauuid`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});