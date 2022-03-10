const { getPool } = require('../db/postgres');
const pool = getPool();
const Mechanic = require('../mechanic/mechanic.model.js');

        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${Mechanic.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            mobile VARCHAR, 
            first_name VARCHAR, 
            last_name VARCHAR, 
            birth_day TIMESTAMPTZ, 
            gender VARCHAR, 
            PRIMARY KEY(id)
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${Mechanic.tableName}; `);
}

module.exports = {
    up,
    down
}
