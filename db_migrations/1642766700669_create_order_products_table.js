const { getPool } = require('../db/postgres');
const pool = getPool();
const OrderProducts = require('../order/orderProducts.model');
        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${OrderProducts.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            order_id uuid NOT NULL,
            product_id uuid NOT NULL,
            price NUMERIC DEFAULT 0.0
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${OrderProducts.tableName}; `);
}

module.exports = {
    up,
    down
}
