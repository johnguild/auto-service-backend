const { getPool, closePool } = require('../../db/postgres');
const {up, down} = require('../../db_migrations/1641039467575_create_users_table.js');
const pool = getPool();
const User = require('../../user/user.model');


afterAll( async () => {
    await closePool();
});

describe('up', () => {
    it('when migrating, will succeed', async() => {
        let err = null;
        try {
            await up();
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // do some assertion
        const res = await pool.query(`SELECT to_regclass('${User.tableName}');`);
        expect(res.rows[0].to_regclass).toBe(User.tableName);

    });
});


describe('down', () => {
    it('when rollback, will succeed', async() => {
        let err = null;
        try {
            await down();
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();
        
        // do some assertion
        const res = await pool.query(`SELECT to_regclass('${User.tableName}');`);
        expect(res.rows[0].to_regclass).toBeNull();
    });
});

