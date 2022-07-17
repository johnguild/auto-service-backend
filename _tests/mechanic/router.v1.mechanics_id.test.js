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

let managerId;
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
    
    managerId = manager.id;
    managerToken = tokenator.generate({ userId: manager.id });
});

beforeEach( async () => {
    await pool.query(`DELETE FROM ${Mechanic.tableName};`);
});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    /// create personal
    const mechanicData = {
        mobile: '639359372676',
        firstName: 'Personnel',
        lastName: 'One',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Male',
    }
    const mechanic = await mechanicDAO.insert(mechanicData);

    // console.log(mechanic);

    const newData = {
        mobile: '63935937268',
        firstName: 'Personnel Edited',
        lastName: 'Two',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Female',
    }

    const response = await request(app)
        .post(`/${v}/mechanics/${mechanic.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.mobile).toBe(newData.mobile);
    expect(response.body.data.firstName).toBe(newData.firstName);
    expect(response.body.data.lastName).toBe(newData.lastName);
    expect(response.body.data.birthDay).toBe(newData.birthDate);
    expect(response.body.data.gender).toBe(newData.gender);

});

it('when with non existing mechanic id data, will fail', async() => {

    /// create personal
    const mechanicData = {
        mobile: '639359372676',
        firstName: 'Personnel',
        lastName: 'One',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Male',
    }
    const mechanic = await mechanicDAO.insert(mechanicData);

    // console.log(mechanic);

    const newData = {
        mobile: '63935937268',
        firstName: 'Personnel Edited',
        lastName: 'Two',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Female',
    }

    /// use manager id instead
    const response = await request(app)
        .post(`/${v}/mechanics/${managerId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(404);


});


it('when with invalid uuid data, will fail', async() => {

    /// create personal
    const mechanicData = {
        mobile: '639359372676',
        firstName: 'Personnel',
        lastName: 'One',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Male',
    }
    const mechanic = await mechanicDAO.insert(mechanicData);

    // console.log(mechanic);

    const newData = {
        mobile: '63935937268',
        firstName: 'Personnel Edited',
        lastName: 'Two',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Female',
    }

    const response = await request(app)
        .post(`/${v}/mechanics/notauuid`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});



it('when with invalid mobile data, will fail', async() => {

    /// create personal
    const mechanicData = {
        mobile: '639359372676',
        firstName: 'Personnel',
        lastName: 'One',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Male',
    }
    const mechanic = await mechanicDAO.insert(mechanicData);

    // console.log(mechanic);

    /// invalid mobile
    const newData = {
        mobile: 'asdfasdf',
        firstName: 'Personnel Edited',
        lastName: 'Two',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Female',
    }

    const response = await request(app)
        .post(`/${v}/mechanics/${mechanic.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

