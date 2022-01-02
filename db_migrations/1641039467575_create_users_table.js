const { getPool } = require('../db/postgres');
const pool = getPool();
const User = require('../user/user.model');
        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${User.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            email VARCHAR, 
            mobile VARCHAR, 
            password VARCHAR, 
            first_name VARCHAR, 
            last_name VARCHAR, 
            birth_day TIMESTAMPTZ, 
            gender VARCHAR, 
            is_disabled BOOL DEFAULT false, 
            reset_password_token VARCHAR, 
            role VARCHAR, 
            PRIMARY KEY (id)
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${User.tableName}; `);
}

module.exports = {
    up,
    down
}
