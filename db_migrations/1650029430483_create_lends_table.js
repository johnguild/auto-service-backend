const { getPool } = require('../db/postgres');
const pool = getPool();
const Lend = require('../lend/lend.model.js');

        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${Lend.tableName} (
            id uuid DEFAULT uuid_generate_v4 (), 
            tool_id uuid NOT NULL, 
            mechanic_id uuid NOT NULL, 
            quantity NUMERIC, 
            borrowed_at TIMESTAMPTZ, 
            remitted_at TIMESTAMPTZ DEFAULT NULL, 
            PRIMARY KEY(id)
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${Lend.tableName}; `);
}

module.exports = {
    up,
    down
}
