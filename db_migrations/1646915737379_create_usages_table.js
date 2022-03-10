const { getPool } = require('../db/postgres');
const pool = getPool();
const Usage = require('../cash/usage.model.js');

        
const up = async() => {
    return pool
        .query(`CREATE TABLE ${Usage.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            cash_id uuid NOT NULL, 
            amount NUMERIC DEFAULT 0.0, 
            purpose VARCHAR, 
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, 
            PRIMARY KEY(id)
        );`);
}

const down = async() => {
    return pool
        .query(`DROP TABLE IF EXISTS ${Usage.tableName}; `);
}

module.exports = {
    up,
    down
}
