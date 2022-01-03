const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const serviceMigration0 = require('../../db_migrations/1641136498591_create_services_table');
const serviceDAO = require('../../service/service.dao');
const Service = require('../../service/service.model');


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
    await serviceMigration0.down();
    // migrate tables
    await userMigration0.up();
    await serviceMigration0.up();


    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    const manager = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });     
    
    managerToken = tokenator.generate({ userId: manager.id });
});

beforeEach( async () => {
    await pool.query(`DELETE FROM ${Service.tableName};`);

});

afterAll( async () => {
    await userMigration0.down();
    await serviceMigration0.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    const serviceData = {
        title: 'Repair Service',
        description: 'Something here',
        cover: 'base64string',
        price: 100.2,
        discountedPrice: undefined,
        isPublic: true,
    }

    const response = await request(app)
        .post(`/${v}/services`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(serviceData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with required only data, will succeed', async() => {

    const serviceData = {
        title: 'Repair Service',
        description: 'Something here',
    }

    const response = await request(app)
        .post(`/${v}/services`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(serviceData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with invalid price data, will fail', async() => {

    const serviceData = {
        title: 'Repair Service',
        description: 'Something here',
        price: "123e"
    }


    const response = await request(app)
        .post(`/${v}/personnels`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(serviceData);

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
 

    const serviceData = {
        title: 'Repair Service',
        description: 'Something here',
        cover: 'base64string',
        price: 100.2,
        discountedPrice: undefined,
        isPublic: true,
    }

    const response = await request(app)
        .post(`/${v}/personnels`)
        .set('Authorization', `Bearer ${token}`)
        .send(serviceData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);
    // expect(response.body.data).not.toBeNull();

});
