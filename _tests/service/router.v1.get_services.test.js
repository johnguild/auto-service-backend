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


it('when getting data without page, will succeed', async() => {

    const serviceData = [
        {
            title: 'Repair Service',
            description: 'Something here',
            cover: 'base64string',
            price: 100.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 2',
            description: 'Something here',
            cover: 'base64string',
            price: 300.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 3',
            description: 'Something here',
            cover: 'base64string',
            price: 200.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 4',
            description: 'Something here',
            cover: 'base64string',
            price: 600.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 5',
            description: 'Something here',
            cover: 'base64string',
            price: 500,
            discountedPrice: undefined,
            isPublic: false,
        },
        
    ];

    for (const p of serviceData) {
        await serviceDAO.insert(p);
    }


    const response = await request(app)
        .get(`/${v}/services`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(serviceData.length);

});



it('when getting data without page and limit, will succeed', async() => {

    
    const serviceData = [
        {
            title: 'Repair Service',
            description: 'Something here',
            cover: 'base64string',
            price: 100.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 2',
            description: 'Something here',
            cover: 'base64string',
            price: 300.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 3',
            description: 'Something here',
            cover: 'base64string',
            price: 200.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 4',
            description: 'Something here',
            cover: 'base64string',
            price: 600.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 5',
            description: 'Something here',
            cover: 'base64string',
            price: 500,
            discountedPrice: undefined,
            isPublic: false,
        },
        
    ];

    for (const p of serviceData) {
        await serviceDAO.insert(p);
    }

    const queryParams = {
        page: 2,
        limit: 1,
    }

    const response = await request(app)
        .get(`/${v}/services`)
        .set('Authorization', `Bearer ${managerToken}`)
        .query(queryParams)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(queryParams.limit);

});
