const { getPool } = require('../db/postgres');
const pool = getPool();
const Stock = require('../stock/stock.model');
        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${Stock.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            product_id uuid NOT NULL, 
            personnel_id uuid NOT NULL, 
            source VARCHAR DEFAULT '', 
            total NUMERIC DEFAULT 0, 
            unit_price NUMERIC DEFAULT 0.0, 
            selling_price NUMERIC DEFAULT 0.0, 
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, 
            PRIMARY KEY(id)
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${Stock.tableName}; `);
}

module.exports = {
    up,
    down
}
