const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const mechanicDAO = require('../../mechanic/mechanic.dao');
const Mechanic = require('../../mechanic/mechanic.model');

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
    await pool.query(`DELETE FROM ${Mechanic.tableName};`);
});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when getting data without page, will succeed', async() => {

    const mechanicData = [
        {
            mobile: '639359372676',
            firstName: 'Personnel',
            lastName: 'One',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Male',
        },
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
    ];

    for (const p of mechanicData) {
        await mechanicDAO.insert(p);
    }


    const response = await request(app)
        .get(`/${v}/mechanics`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(mechanicData.length);

});



it('when getting data without page and limit, will succeed', async() => {

    const mechanicData = [
        {
            mobile: '639359372676',
            firstName: 'Personnel',
            lastName: 'One',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Male',
        },
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
    ];

    for (const p of mechanicData) {
        await mechanicDAO.insert(p);
    }

    const queryParams = {
        page: 2,
        limit: 1,
    }

    const response = await request(app)
        .get(`/${v}/mechanics`)
        .set('Authorization', `Bearer ${managerToken}`)
        .query(queryParams)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(queryParams.limit);

});
