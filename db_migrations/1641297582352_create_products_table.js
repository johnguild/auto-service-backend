const { getPool } = require('../db/postgres');
const pool = getPool();
const Product = require('../product/product.model');
        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${Product.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            name VARCHAR, 
            description VARCHAR, 
            PRIMARY KEY(id)
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${Product.tableName}; `);
}
module.exports = {
    up,
    down
}
