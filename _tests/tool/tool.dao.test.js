const jwt = require('jsonwebtoken');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const toolMigration0 = require('../../db_migrations/1648809625370_create_tools_tables');
const Tool = require('../../tool/tool.model');
const toolDAO = require('../../tool/tool.dao');


const tool1Data = {
    name: 'Repair Tool',
    description: 'Something here',
    cover: 'base64string here',
    quantity: 100,
    available: 100,
}


beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await toolMigration0.down();
    // migrate tables
    await toolMigration0.up();
});

beforeEach( async() => {
    await pool.query(`
        DELETE FROM ${Tool.tableName};
    `);
});

afterAll( async() => {
    await toolMigration0.down();
    await closePool();
});


describe('insert', () => {

    it('when creating with valid and without products, will succeed', async() => {

        const toolData = {
            name: 'Repair Tool',
            description: 'Something here',
            cover: 'base64string here',
            quantity: 100,
            available: 100
        }

        let err = null;
        try {
            const tool = await toolDAO.insert(toolData);

            // console.dir(tool, {depth: null});

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // assert tool saved
        const res = await pool.query(`SELECT * FROM ${Tool.tableName};`);
        expect(res.rows.length).toBe(1);
        expect(res.rows[0].name).toBe(tool1Data.name);
        expect(res.rows[0].description).toBe(tool1Data.description);
        expect(res.rows[0].cover).toBe(tool1Data.cover);
        expect(parseFloat(res.rows[0].quantity)).toBe(tool1Data.quantity);
        expect(parseFloat(res.rows[0].available)).toBe(tool1Data.available);
    });

});

describe('update', () => {

    it('when updating email and last_name by id, will succeed', async() => {
        // create data first
        const tool = await toolDAO.insert(tool1Data);

        // console.log(manager.id);

        const newName = 'This is a new name';
        const newDescription = 'New Description';

        let err = null;
        try {
            const updated = await toolDAO.update(
                data={name: newName, description: newDescription},
                where={id: tool.id }
            );

            // console.log(updated);

        } catch (error) {
            err = error;
            // console.log(error);
        }
        expect(err).toBeNull();

        // assert values updated
        const savedTool = await pool.query(`SELECT * FROM ${Tool.tableName};`);
        expect(savedTool.rows.length).toBe(1);
        expect(savedTool.rows[0].id).toBe(tool.id);
        expect(savedTool.rows[0].name).toBe(newName);
        expect(savedTool.rows[0].description).toBe(newDescription);

    });


});

describe('find', () => {

    it('when finding by available 20 on records, will succeed', async() => {
        /// create tools first
        const toolData = [
            {
                name: 'Repair Tool',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 100,
                available: 100,
            },
            {
                name: 'Repair Tool 2',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 99,
                available: 20,
            },
            {
                name: 'Repair Tool 3',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 60,
                available: 20,
            },
        ]

        for (const data of toolData) {
            const c = await toolDAO.insert(data);
            // console.log(c);
        }


        let err = null;
        try {
            const search1 = await toolDAO.find( 
                where= { available: 20 } 
            );

            expect(search1.length).toBe(2);


            const search2 = await toolDAO.find( 
                where= { available: 100 } 
            );

            expect(search2.length).toBe(1);
            // console.log(searchRes[0]);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

    });


    it('when finding all with limit, will succeed', async() => {

        /// create tools first
        const toolData = [
            {
                name: 'Repair Tool',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 100,
                available: 100,
            },
            {
                name: 'Repair Tool 2',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 99,
                available: 100,
            },
            {
                name: 'Repair Tool 3',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 60,
                available: 100,
            },
        ]

        for (const data of toolData) {
            const c = await toolDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await toolDAO.find( 
                where= {},
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

        /// create tools first
        const toolData = [
            {
                name: 'Repair Tool',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 100,
                available: 100,
            },
            {
                name: 'Repair Tool 2',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 99,
                available: 100,
            },
            {
                name: 'Repair Tool 3',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 60,
                available: 100,
            },
        ]

        for (const data of toolData) {
            const c = await toolDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await toolDAO.find( 
                where= {},
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

        /// create tools first
        const toolData = [
            {
                name: 'Repair Tool',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 100,
                available: 100,
            },
            {
                name: 'Repair Tool 2',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 99,
                available: 100,
            },
            {
                name: 'Repair Tool 3',
                description: 'Something here',
                cover: 'base64string here',
                quantity: 60,
                available: 100,
            },
        ]

        for (const data of toolData) {
            const c = await toolDAO.insert(data);
            // console.log(c);
        }

      
        let err = null;
        try {
            const searchRes = await toolDAO.find( 
                where= {},
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



