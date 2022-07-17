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

let managerId;
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
    
    managerId = manager.id;
    managerToken = tokenator.generate({ userId: manager.id });
});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    /// create personal
    const personnelData = {
        email: 'person1.autoservice@gmail.com',
        mobile: '639359372676',
        password: 'P@ssW0rd',
        firstName: 'Personnel',
        lastName: 'One',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Male',
        role: User.ROLE_PERSONNEL,
    }
    const encryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    const personnel = await userDAO.insert(data = {
        ...personnelData,
        password: encryptedPass
    });

    // console.log(personnel);

    const newData = {
        email: 'person.autoservice@gmail.com',
        mobile: '63935937268',
        firstName: 'Personnel Edited',
        lastName: 'Two',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Female',
    }

    const response = await request(app)
        .post(`/${v}/personnels/${personnel.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.email).toBe(newData.email);
    expect(response.body.data.mobile).toBe(newData.mobile);
    expect(response.body.data.firstName).toBe(newData.firstName);
    expect(response.body.data.lastName).toBe(newData.lastName);
    expect(response.body.data.birthDay).toBe(newData.birthDate);
    expect(response.body.data.gender).toBe(newData.gender);

});

it('when with non existing personnel id data, will fail', async() => {

    /// create personal
    const personnelData = {
        email: 'person1.autoservice@gmail.com',
        mobile: '639359372676',
        password: 'P@ssW0rd',
        firstName: 'Personnel',
        lastName: 'One',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Male',
        role: User.ROLE_PERSONNEL,
    }
    const encryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    const personnel = await userDAO.insert(data = {
        ...personnelData,
        password: encryptedPass
    });

    // console.log(personnel);

    const newData = {
        email: 'personEdited.autoservice@gmail.com',
        mobile: '63935937268',
        firstName: 'Personnel Edited',
        lastName: 'Two',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Female',
    }

    /// use manager id instead
    const response = await request(app)
        .post(`/${v}/personnels/${managerId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(404);

});


it('when with invalid uuid data, will fail', async() => {

    /// create personal
    const personnelData = {
        email: 'person1.autoservice@gmail.com',
        mobile: '639359372676',
        password: 'P@ssW0rd',
        firstName: 'Personnel',
        lastName: 'One',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Male',
        role: User.ROLE_PERSONNEL,
    }
    const encryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    const personnel = await userDAO.insert(data = {
        ...personnelData,
        password: encryptedPass
    });

    // console.log(personnel);

    const newData = {
        email: 'person.autoservice@gmail.com',
        mobile: '63935937268',
        firstName: 'Personnel Edited',
        lastName: 'Two',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Female',
    }

    const response = await request(app)
        .post(`/${v}/personnels/notauuid`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});



it('when with invalid email data, will fail', async() => {

    /// create personal
    const personnelData = {
        email: 'person1.autoservice@gmail.com',
        mobile: '639359372676',
        password: 'P@ssW0rd',
        firstName: 'Personnel',
        lastName: 'One',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Male',
        role: User.ROLE_PERSONNEL,
    }
    const encryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    const personnel = await userDAO.insert(data = {
        ...personnelData,
        password: encryptedPass
    });

    // console.log(personnel);

    /// invalid email
    const newData = {
        email: 'personEdited.autoservicegmail.com',
        mobile: '63935937268',
        firstName: 'Personnel Edited',
        lastName: 'Two',
        birthDate: new Date(Date.now()).toISOString(),
        gender: 'Female',
    }

    const response = await request(app)
        .post(`/${v}/personnels/${personnel.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});



it('when with taken email data, will fail', async() => {

    /// create personal
    const personnelsData = [
        {
            email: 'person1.autoservice@gmail.com',
            mobile: '639359372676',
            password: 'P@ssW0rd',
            firstName: 'Personnel',
            lastName: 'One',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Male',
            role: User.ROLE_PERSONNEL,
        },
        {
            email: 'person2.autoservice@gmail.com',
            mobile: '639359372676',
            password: 'P@ssW0rd',
            firstName: 'Personnel',
            lastName: 'Two',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Female',
            role: User.ROLE_PERSONNEL,
        }
    ];

    const personnels = [];
    for (const pd of personnelsData) {
        const encryptedPass = await bcrypt.hash(pd.password, parseInt(process.env.BCRYPT_SALT));
        const personnel = await userDAO.insert(data = {
            ...pd,
            password: encryptedPass
        });
        personnels.push(personnel);
    }


    const response = await request(app)
        .post(`/${v}/personnels/${personnels[0].id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
            email: personnels[1].email
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});