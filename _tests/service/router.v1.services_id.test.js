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

let managerId;
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
    
    managerId = manager.id;
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

    /// create service
    const serviceData = {
        title: 'Repair Service',
        description: 'Something here',
        cover: 'base64string',
        price: 100.2,
        discountedPrice: undefined,
        isPublic: true,
    }
    const service = await serviceDAO.insert(serviceData);

    // console.log(personnel);

    const newData = {
        title: 'Repair Service e',
        description: 'Something here e',
        cover: 'base64string',
        price: 300.2,
        discountedPrice: 100.2,
        isPublic: false,
    }

    const response = await request(app)
        .post(`/${v}/services/${service.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.title).toBe(newData.title);
    expect(response.body.data.description).toBe(newData.description);
    expect(response.body.data.cover).toBe(newData.cover);
    expect(parseFloat(response.body.data.price)).toBe(newData.price);
    expect(parseFloat(response.body.data.discountedPrice)).toBe(newData.discountedPrice);
    expect(response.body.data.isPublic).toBe(newData.isPublic);

});

it('when with non existing service id data, will fail', async() => {

    const newData = {
        title: 'Repair Service e',
        description: 'Something here e',
        cover: 'base64string',
        price: 300.2,
        discountedPrice: 100.2,
        isPublic: false,
    }

    /// use manager id instead
    const response = await request(app)
        .post(`/${v}/services/${managerId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(404);

});

it('when with invalid uuid data, will fail', async() => {

    const newData = {
        title: 'Repair Service e',
        description: 'Something here e',
        cover: 'base64string',
        price: 300.2,
        discountedPrice: 100.2,
        isPublic: false,
    }

    const response = await request(app)
        .post(`/${v}/services/notauuid`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});