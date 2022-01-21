const { getPool } = require('../db/postgres');
const pool = getPool();
const Order = require('../order/order.model');
        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${Order.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            customer_id uuid NOT NULL,
            total NUMERIC DEFAULT 0.0,
            installments NUMERIC DEFAULT 0,
            completed BOOL DEFAULT false,
            PRIMARY KEY(id)
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${Order.tableName}; `);
}

module.exports = {
    up,
    down
}
