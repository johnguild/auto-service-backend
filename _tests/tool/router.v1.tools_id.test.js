const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const toolMigration0 = require('../../db_migrations/1648809625370_create_tools_tables');
const toolDAO = require('../../tool/tool.dao');
const Tool = require('../../tool/tool.model');


const { app } = require('../../app');
const v = 'v1';

const clerkData = {
    email: 'johnrobin.autotool@gmail.com',
    mobile: '639359372676',
    password: 'P@ssW0rd',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_CLERK,
}

let clerkId;
let clerkToken;


beforeAll( async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await userMigration0.down();
    await toolMigration0.down();
    // migrate tables
    await userMigration0.up();
    await toolMigration0.up();

    const clerkEncryptedPass = await bcrypt.hash(clerkData.password, parseInt(process.env.BCRYPT_SALT));
    const clerk = await userDAO.insert(data = {
        ...clerkData,
        password: clerkEncryptedPass,
    });     
    
    clerkId = clerk.id;
    clerkToken = tokenator.generate({ userId: clerk.id });
});

beforeEach( async () => {
    await pool.query(`
        DELETE FROM ${Tool.tableName};
    `);

});

afterAll( async () => {
    await userMigration0.down();
    await toolMigration0.down();
    await closePool();
});


it('when with valid data will succeed', async() => {


    /// create tool
    const toolData = {
        name: 'Repair Tool',
        description: 'Something here',
        cover: 'base64string',
        quantity: 100,
        available: 100, 
    }
    const tool = await toolDAO.insert(toolData);

    // console.log(personnel);

    const newData = {
        name: 'Repair Tool e',
        description: 'Something here e',
        cover: 'base64string',
        quantity: 300,
    }

    const response = await request(app)
        .post(`/${v}/tools/${tool.id}`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.name).toBe(newData.name);
    expect(response.body.data.description).toBe(newData.description);
    expect(response.body.data.cover).toBe(newData.cover);
    expect(parseFloat(response.body.data.quantity)).toBe(newData.quantity);
    expect(parseFloat(response.body.data.available)).toBe(newData.quantity);

});

it('when with non existing tool id data, will fail', async() => {

    const newData = {
        name: 'Repair Tool e',
        description: 'Something here e',
        cover: 'base64string',
        quantity: 300,
    }

    /// use clerk id instead
    const response = await request(app)
        .post(`/${v}/tools/${clerkId}`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(404);

});

it('when with invalid uuid data, will fail', async() => {

    const newData = {
        name: 'Repair Tool e',
        description: 'Something here e',
        cover: 'base64string',
        quantity: 300,
    }

    const response = await request(app)
        .post(`/${v}/tools/notauuid`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});