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


it('when with valid data without products, will succeed', async() => {

    const toolData = {
        name: 'Repair Tool',
        description: 'Something here',
        cover: 'base64string',
        quantity: 100,
    }

    const response = await request(app)
        .post(`/${v}/tools`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(toolData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});


it('when with required only data, will succeed', async() => {

    const toolData = {
        name: 'Repair Tool',
        description: 'Something here',
    }

    const response = await request(app)
        .post(`/${v}/tools`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(toolData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with invalid quantity data, will fail', async() => {

    const toolData = {
        name: 'Repair Tool',
        description: 'Something here',
        quantity: "123e"
    }


    const response = await request(app)
        .post(`/${v}/tools`)
        .set('Authorization', `Bearer ${clerkToken}`)
        .send(toolData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when with valid data but using customer account, will succeed', async() => {

    /// create customer first
    const customerData = {
        email: 'mup.autotool@gmail.com',
        password: 'P@ssW0rd',
        firstName: 'Muphy',
        lastName: 'Tayag',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Female',
        role: User.ROLE_CUSTOMER,
    }
    const customerEncryptedPass = await bcrypt.hash(customerData.password, parseInt(process.env.BCRYPT_SALT));
    const customer = await userDAO.insert(data = {
        ...customerData,
        password: customerEncryptedPass,
    });  

    /// create token
    const token = tokenator.generate({ userId: customer.id });
 

    const toolData = {
        name: 'Repair Tool',
        description: 'Something here',
        cover: 'base64string',
        quantity: 100,
    }

    const response = await request(app)
        .post(`/${v}/tools`)
        .set('Authorization', `Bearer ${token}`)
        .send(toolData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);
    // expect(response.body.data).not.toBeNull();

});
