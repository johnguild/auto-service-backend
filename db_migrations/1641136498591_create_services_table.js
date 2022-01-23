const { getPool } = require('../db/postgres');
const pool = getPool();
const Service = require('../service/service.model');
        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${Service.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            title VARCHAR, 
            description VARCHAR, 
            is_public BOOL DEFAULT false,
            cover VARCHAR, 
            price NUMERIC DEFAULT 0.0, 
            discounted_price NUMERIC, 
            products uuid[] DEFAULT '{}', 
            PRIMARY KEY(id)
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${Service.tableName}; `);
}

module.exports = {
    up,
    down
}
