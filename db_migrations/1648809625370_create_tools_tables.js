const { getPool } = require('../db/postgres');
const pool = getPool();
const Tool = require('../tool/tool.model.js');

        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${Tool.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            name VARCHAR, 
            description VARCHAR, 
            quantity NUMERIC DEFAULT 0, 
            available NUMERIC DEFAULT 0, 
            cover VARCHAR, 
            PRIMARY KEY(id)
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${Tool.tableName}; `);
}

module.exports = {
    up,
    down
}
