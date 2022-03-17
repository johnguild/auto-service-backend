const { getPool, closePool } = require('../../db/postgres');
const addTable = require('../../db_migrations/1641039467575_create_users_table');
const {up, down} = require('../../db_migrations/1647518448506_add_company_details_on_users_table.js');
const pool = getPool();
const User = require('../../user/user.model.js');


afterAll( async () => {
    await closePool();
});

describe('up', () => {
    it('when migrating, will succeed', async() => {
        let err = null;
        try {
            await new Promise(resolve => setTimeout(() => resolve(), 100));
            await addTable.up();
            await up();
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();
        
    // do some assertion
    const res = await pool.query(`SELECT * FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${User.tableName}';`);
    // expect(res.rows[0].to_regclass).toBe(User.tableName);
    // console.dir(res, {depth: null});

    let hasCompanyName = false, hasCompanyNumber = false, hasCompanyAddress = false, hasCompanyTin = false;
    res.rows.forEach(ele => {
        if (ele.column_name === 'company_name') hasCompanyName = true;
        if (ele.column_name === 'company_number') hasCompanyNumber = true;
        if (ele.column_name === 'company_address') hasCompanyAddress = true;
        if (ele.column_name === 'company_tin') hasCompanyTin = true;
    });
    expect(hasCompanyName).toBe(true);
    expect(hasCompanyNumber).toBe(true);
    expect(hasCompanyAddress).toBe(true);
    expect(hasCompanyTin).toBe(true);


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
        const res = await pool.query(`SELECT * FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${User.tableName}';`);
        // expect(res.rows[0].to_regclass).toBe(User.tableName);
        // console.dir(res, {depth: null});

        let hasCompanyName = false, hasCompanyNumber = false, hasCompanyAddress = false, hasCompanyTin = false;
        res.rows.forEach(ele => {
            if (ele.column_name === 'company_name') hasCompanyName = true;
            if (ele.column_name === 'company_number') hasCompanyNumber = true;
            if (ele.column_name === 'company_address') hasCompanyAddress = true;
            if (ele.column_name === 'company_tin') hasCompanyTin = true;
        });
        expect(hasCompanyName).toBe(false);
        expect(hasCompanyNumber).toBe(false);
        expect(hasCompanyAddress).toBe(false);
        expect(hasCompanyTin).toBe(false);


        await addTable.down();
    });
});

