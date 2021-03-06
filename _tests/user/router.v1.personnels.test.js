const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

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
});

beforeEach( async () => {
    await pool.query(`DELETE FROM ${User.tableName};`);

    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    const manager = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });     
    
    managerToken = tokenator.generate({ userId: manager.id });
});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    const personnelData = {
        email: 'person1.autoservice@gmail.com',
        mobile: '639359372676',
        password: 'P@ssW0rd',
        firstName: 'Personnel',
        lastName: 'One',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Male',
    }

    const response = await request(app)
        .post(`/${v}/personnels`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(personnelData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});



it('when with required only data, will succeed', async() => {

    const personnelData = {
        email: 'person1.autoservice@gmail.com',
        password: 'P@ssW0rd',
        firstName: 'Personnel',
        lastName: 'One',
        gender: 'Female'
    }

    const response = await request(app)
        .post(`/${v}/personnels`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(personnelData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});


it('when with invalid gender data, will fail', async() => {

    const personnelData = {
        email: 'person1.autoservice@gmail.com',
        password: 'P@ssW0rd',
        firstName: 'Personnel',
        lastName: 'One',
        gender: 'NotGender'
    }

    const response = await request(app)
        .post(`/${v}/personnels`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(personnelData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});



it('when with invalid birthDate data, will fail', async() => {

    const personnelData = {
        email: 'person1.autoservice@gmail.com',
        password: 'P@ssW0rd',
        firstName: 'Personnel',
        lastName: 'One',
        gender: 'Male',
        birthDate: 'Feb 26, 1992'
    }

    const response = await request(app)
        .post(`/${v}/personnels`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(personnelData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});


it('when with valid data but using customer account, will succeed', async() => {

    /// create customer first
    const customerData = {
        email: 'mup.autoservice@gmail.com',
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
 

    const personnelData = {
        email: 'person1.autoservice@gmail.com',
        mobile: '639359372676',
        password: 'P@ssW0rd',
        firstName: 'Personnel',
        lastName: 'One',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Male',
    }

    const response = await request(app)
        .post(`/${v}/personnels`)
        .set('Authorization', `Bearer ${token}`)
        .send(personnelData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);
    // expect(response.body.data).not.toBeNull();

});
