const { getPool } = require('../db/postgres');
const pool = getPool();
const User = require('../user/user.model.js');

        
const up = async() => {
    return await pool
        .query(`
            ALTER TABLE ${User.tableName} 
                ADD COLUMN IF NOT EXISTS company_name VARCHAR;
            ALTER TABLE ${User.tableName} 
                ADD COLUMN IF NOT EXISTS company_number VARCHAR;
            ALTER TABLE ${User.tableName} 
                ADD COLUMN IF NOT EXISTS company_address VARCHAR;
            ALTER TABLE ${User.tableName} 
                ADD COLUMN IF NOT EXISTS company_tin VARCHAR;
        ;`);
}

const down = async() => {
    return await pool
        .query(`
            ALTER TABLE ${User.tableName} 
                DROP COLUMN IF EXISTS company_name;
            ALTER TABLE ${User.tableName} 
                DROP COLUMN IF EXISTS company_number;
            ALTER TABLE ${User.tableName} 
                DROP COLUMN IF EXISTS company_address;
            ALTER TABLE ${User.tableName} 
                DROP COLUMN IF EXISTS company_tin;
        `);
}

module.exports = {
    up,
    down
}
