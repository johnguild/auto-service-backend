const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const toolDAO = require('../../tool/tool.dao');
const Tool = require('../../tool/tool.model');

const { app } = require('../../app');
const v = 'v1';

const managerData = {
    email: 'johnrobin.autotool@gmail.com',
    mobile: '639359372676',
    password: 'P@ssW0rd',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_CLERK,
}

let managerToken;


beforeAll( async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await migrate.down();
    // migrate tables
    await migrate.up();


    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    const manager = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });     
    
    managerToken = tokenator.generate({ userId: manager.id });
});

beforeEach( async () => {
    await pool.query(`
        DELETE FROM ${Tool.tableName};
    `);

});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when getting data without page, will succeed', async() => {

    const toolData = [
        {
            name: 'Repair Tool',
            description: 'Something here',
            cover: 'base64string',
            quantity: 100,
        },
        {
            name: 'Repair Tool 2',
            description: 'Something here',
            cover: 'base64string',
            quantity: 300,
        },
        {
            name: 'Repair Tool 3',
            description: 'Something here',
            cover: 'base64string',
            quantity: 200,
        },
        {
            name: 'Repair Tool 4',
            description: 'Something here',
            cover: 'base64string',
            quantity: 600,
        },
        {
            name: 'Repair Tool 5',
            description: 'Something here',
            cover: 'base64string',
            quantity: 500,
        },
        
    ];

    for (const p of toolData) {
        await toolDAO.insert(p);
    }


    const response = await request(app)
        .get(`/${v}/tools`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(toolData.length);

});



it('when getting data without page and limit, will succeed', async() => {

    
    const toolData = [
        {
            name: 'Repair Tool',
            description: 'Something here',
            cover: 'base64string',
            quantity: 100,
        },
        {
            name: 'Repair Tool 2',
            description: 'Something here',
            cover: 'base64string',
            quantity: 300,
        },
        {
            name: 'Repair Tool 3',
            description: 'Something here',
            cover: 'base64string',
            quantity: 200,
        },
        {
            name: 'Repair Tool 4',
            description: 'Something here',
            cover: 'base64string',
            quantity: 600,
        },
        {
            name: 'Repair Tool 5',
            description: 'Something here',
            cover: 'base64string',
            quantity: 500,
        },
        
    ];

    for (const p of toolData) {
        await toolDAO.insert(p);
    }

    const queryParams = {
        page: 2,
        limit: 1,
    }

    const response = await request(app)
        .get(`/${v}/tools`)
        .set('Authorization', `Bearer ${managerToken}`)
        .query(queryParams)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(queryParams.limit);

});
