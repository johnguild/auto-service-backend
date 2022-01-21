const { getPool } = require('../db/postgres');
const pool = getPool();
const OrderPayments = require('../order/orderPayments.model');
        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${OrderPayments.tableName} (
            order_id uuid NOT NULL,
            amount NUMERIC DEFAULT 0.0,
            date_time TIMESTAMPTZ
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${OrderPayments.tableName}; `);
}

module.exports = {
    up,
    down
}
