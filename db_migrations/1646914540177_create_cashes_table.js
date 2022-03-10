const { getPool } = require('../db/postgres');
const pool = getPool();
const Cash = require('../cash/cash.model.js');

        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${Cash.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            amount NUMERIC DEFAULT 0.0, 
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, 
            PRIMARY KEY(id)
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${Cash.tableName}; `);
}

module.exports = {
    up,
    down
}
