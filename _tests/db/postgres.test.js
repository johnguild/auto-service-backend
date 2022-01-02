const {getPool, closePool} = require('../../db/postgres');
const pool =  getPool();

beforeEach( async () => {
    // await User.deleteMany();
    // await Role.deleteMany();

    // await new User(adminUser).save();
});

afterAll( async () => {
    await closePool();
});


describe('postgres', () => {
    
    it('when connecting with data by getting the pool, will succeed', async () => {

        let err = null;
        try {
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
