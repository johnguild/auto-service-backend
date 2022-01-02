const {getPool, closePool} = require('../../db/postgres');
const pool =  getPool();


beforeAll( async() => {
    // await new Promise(resolve => setTimeout(() => resolve(), 100));
});

beforeEach( async () => {
    // await new Promise(resolve => setTimeout(() => resolve(), 100));
});

afterAll( async () => {
    await closePool();
});


describe('postgres', () => {
    
    it('when connecting with data by getting the pool, will succeed', async () => {

        let err = null;
        try {
            await new Promise(resolve => setTimeout(() => resolve(), 100));
            const res = await pool.query(`SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE  table_schema = 'schema_name'
                            AND    table_name   = 'migrations'
                            );`);
            expect(res.rows[0].exists).toBe(false);

        } catch (error) {
            err = error;
        }

        expect(err).toBeNull();

    });

});
