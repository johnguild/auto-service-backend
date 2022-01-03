const jwt = require('jsonwebtoken');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const serviceMigration0 = require('../../db_migrations/1641136498591_create_services_table');

const Service = require('../../service/service.model');
const serviceDAO = require('../../service/service.dao');

const service1Data = {
    title: 'Repair Service',
    description: 'Something here',
    cover: 'base64string here',
    price: 100.2,
    discountedPrice: undefined,
    isPublic: true,
}


beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await serviceMigration0.down();
    // migrate tables
    await serviceMigration0.up();
    // await loginTokenMigration0.down().then(() => loginTokenMigration0.up());
    // await companyMigration0.down().then(() => companyMigration0.up());
});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Service.tableName};`);
    // await pool.query(`DELETE FROM ${LoginToken.tableName};`);
    // await pool.query(`DELETE FROM ${Company.tableName};`);
});

afterAll( async() => {
    await serviceMigration0.down();
    // await loginTokenMigration0.down();
    // await companyMigration0.down();
    await closePool();
});


describe('create', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        let err = null;
        try {
            await serviceDAO.insert(service1Data);

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert service saved
        const res = await pool.query(`SELECT * FROM ${Service.tableName};`);
        expect(res.rows.length).toBe(1);
        expect(res.rows[0].title).toBe(service1Data.title);
        expect(res.rows[0].description).toBe(service1Data.description);
        expect(res.rows[0].cover).toBe(service1Data.cover);
        expect(parseFloat(res.rows[0].price)).toBe(service1Data.price);
        expect(res.rows[0].discountedPrice).toBe(undefined);
        expect(res.rows[0].is_public).toBe(service1Data.isPublic);
    });

    it('when creating with valid but without price, will succeed', async() => {

        let err = null;
        try {
            await serviceDAO.insert({
                ...service1Data,
                price: undefined
            });

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert service saved
        const res = await pool.query(`SELECT * FROM ${Service.tableName};`);
        expect(res.rows[0].title).toBe(service1Data.title);
        expect(res.rows[0].description).toBe(service1Data.description);
        expect(res.rows[0].cover).toBe(service1Data.cover);
        expect(parseFloat(res.rows[0].price)).toBe(0.0);
        expect(res.rows[0].discountedPrice).toBe(undefined);
        expect(res.rows[0].is_public).toBe(service1Data.isPublic);
    });

});

describe('update', () => {

    it('when updating email and last_name by id, will succeed', async() => {
        // create data first
        const service = await serviceDAO.insert(service1Data);

        // console.log(manager.id);

        const newTitle = 'This is a new title';
        const newDescription = 'New Description';

        let err = null;
        try {
            const updated = await serviceDAO.update(
                data={title: newTitle, description: newDescription},
                where={id: service.id }
            );

            // console.log(updated);

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();

        // assert values updated
        const savedService = await pool.query(`SELECT * FROM ${Service.tableName};`);
        expect(savedService.rows.length).toBe(1);
        expect(savedService.rows[0].id).toBe(service.id);
        expect(savedService.rows[0].title).toBe(newTitle);
        expect(savedService.rows[0].description).toBe(newDescription);

    });

    it('when updating price, discountedPrice, is_public by id, will succeed', async() => {
        // create data first
        const service = await serviceDAO.insert(service1Data);

        // console.log(manager.id);

        const newPrice = 111;
        const newDP = 99.99;
        const newPublic = false;

        let err = null;
        try {
            await serviceDAO.update(
                data={
                    price: newPrice,
                    discountedPrice: newDP,
                    isPublic: newPublic
                },
                where={id: service.id}
            );

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();

        // assert values updated
        const savedService = await pool.query(`SELECT * FROM ${Service.tableName};`);
        expect(savedService.rows.length).toBe(1);
        expect(savedService.rows[0].id).toBe(service.id);
        expect(parseFloat(savedService.rows[0].price)).toBe(newPrice);
        expect(parseFloat(savedService.rows[0].discounted_price)).toBe(newDP);
        expect(savedService.rows[0].is_public).toBe(newPublic);

    });

});

describe('search', () => {

    it('when finding by is_public on records, will succeed', async() => {
        /// create services first
        const serviceData = [
            {
                title: 'Repair Service',
                description: 'Something here',
                cover: 'base64string here',
                price: 100.2,
                discountedPrice: undefined,
                isPublic: true,
            },
            {
                title: 'Repair Service 2',
                description: 'Something here',
                cover: 'base64string here',
                price: 99.2,
                discountedPrice: undefined,
                isPublic: false,
            },
            {
                title: 'Repair Service 3',
                description: 'Something here',
                cover: 'base64string here',
                price: 60.2,
                discountedPrice: undefined,
                isPublic: false,
            },
        ]

        for (const data of serviceData) {
            const c = await serviceDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await serviceDAO.find( 
                where= {isPublic: true } 
            );

            expect(search1.length).toBe(1);
            expect(search1[0].title).toBe(serviceData[0].title);


            const search2 = await serviceDAO.find( 
                where= {isPublic: false } 
            );

            expect(search2.length).toBe(2);
            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with limit, will succeed', async() => {

        /// create services first
        const serviceData = [
            {
                title: 'Repair Service',
                description: 'Something here',
                cover: 'base64string here',
                price: 100.2,
                discountedPrice: undefined,
                isPublic: true,
            },
            {
                title: 'Repair Service 2',
                description: 'Something here',
                cover: 'base64string here',
                price: 99.2,
                discountedPrice: undefined,
                isPublic: false,
            },
            {
                title: 'Repair Service 3',
                description: 'Something here',
                cover: 'base64string here',
                price: 60.2,
                discountedPrice: undefined,
                isPublic: false,
            },
        ]

        for (const data of serviceData) {
            const c = await serviceDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await serviceDAO.find( 
                where= {isPublic: false},
                options= {limit: 2}
            );

            expect(searchRes.length).toBe(2);

            // console.log(searchRes);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with skip, will succeed', async() => {

        /// create services first
        const serviceData = [
            {
                title: 'Repair Service',
                description: 'Something here',
                cover: 'base64string here',
                price: 100.2,
                discountedPrice: undefined,
                isPublic: true,
            },
            {
                title: 'Repair Service 2',
                description: 'Something here',
                cover: 'base64string here',
                price: 99.2,
                discountedPrice: undefined,
                isPublic: true,
            },
            {
                title: 'Repair Service 3',
                description: 'Something here',
                cover: 'base64string here',
                price: 60.2,
                discountedPrice: undefined,
                isPublic: true,
            },
        ]

        for (const data of serviceData) {
            const c = await serviceDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await serviceDAO.find( 
                where= {isPublic: true},
                options= {skip: 2}
            );

            expect(searchRes.length).toBe(1);

            // console.log(searchRes);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });

    it('when finding all with limit and skip, will succeed', async() => {

        /// create services first
        const serviceData = [
            {
                title: 'Repair Service',
                description: 'Something here',
                cover: 'base64string here',
                price: 100.2,
                discountedPrice: undefined,
                isPublic: true,
            },
            {
                title: 'Repair Service 2',
                description: 'Something here',
                cover: 'base64string here',
                price: 99.2,
                discountedPrice: undefined,
                isPublic: true,
            },
            {
                title: 'Repair Service 3',
                description: 'Something here',
                cover: 'base64string here',
                price: 60.2,
                discountedPrice: undefined,
                isPublic: true,
            },
        ]

        for (const data of serviceData) {
            const c = await serviceDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await serviceDAO.find( 
                where= {isPublic: true},
                options= {limit: 1, skip: 1}
            );

            expect(searchRes.length).toBe(1);

            // console.log(searchRes);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });
});



