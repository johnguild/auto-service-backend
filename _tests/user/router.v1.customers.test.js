const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
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
    await userMigration0.down();
    // migrate tables
    await userMigration0.up();
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
    await userMigration0.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    const customerData = {
        email: 'person1.autoservice@gmail.com',
        mobile: '639359372676',
        password: 'P@ssW0rd',
        firstName: 'Customer',
        lastName: 'One',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Male',
    }

    const response = await request(app)
        .post(`/${v}/customers`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(customerData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});


it('when with required only data, will succeed', async() => {

    const customerData = {
        email: 'person1.autoservice@gmail.com',
        password: 'P@ssW0rd',
        firstName: 'Customer',
        lastName: 'One',
        gender: 'Female'
    }

    const response = await request(app)
        .post(`/${v}/customers`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(customerData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with invalid gender data, will fail', async() => {

    const customerData = {
        email: 'person1.autoservice@gmail.com',
        password: 'P@ssW0rd',
        firstName: 'Customer',
        lastName: 'One',
        gender: 'NotGender'
    }

    const response = await request(app)
        .post(`/${v}/customers`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(customerData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when with invalid birthDate data, will fail', async() => {

    const customerData = {
        email: 'person1.autoservice@gmail.com',
        password: 'P@ssW0rd',
        firstName: 'Customer',
        lastName: 'One',
        gender: 'Male',
        birthDate: 'Feb 26, 1992'
    }

    const response = await request(app)
        .post(`/${v}/customers`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(customerData);

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
 

    const newCustomerData = {
        email: 'person1.autoservice@gmail.com',
        mobile: '639359372676',
        password: 'P@ssW0rd',
        firstName: 'Personnel',
        lastName: 'One',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Male',
    }

    const response = await request(app)
        .post(`/${v}/customers`)
        .set('Authorization', `Bearer ${token}`)
        .send(newCustomerData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);
    // expect(response.body.data).not.toBeNull();

});
