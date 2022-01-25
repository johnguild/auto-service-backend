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
            car_make VARCHAR(300) NOT NULL,
            car_type VARCHAR(300) NOT NULL,
            car_year VARCHAR(300) NOT NULL,
            car_plate VARCHAR(300) NOT NULL,
            car_odometer VARCHAR(300) NOT NULL,
            working_days NUMERIC DEFAULT 0,
            down_payment NUMERIC DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
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
