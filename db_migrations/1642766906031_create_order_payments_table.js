const { getPool } = require('../db/postgres');
const pool = getPool();
const OrderPayments = require('../order/orderPayments.model');
        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${OrderPayments.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            order_id uuid NOT NULL, 
            type VARCHAR(100), 
            bank VARCHAR(300),
            reference_number VARCHAR(300),
            account_name VARCHAR(300),
            account_number VARCHAR(300),
            cheque_number VARCHAR(300),   
            amount NUMERIC DEFAULT 0.0,
            date_time TIMESTAMPTZ, 
            PRIMARY KEY(id)
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
