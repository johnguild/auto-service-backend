const { getPool } = require('../db/postgres');
const pool = getPool();
const OrderServices = require("../order/orderServices.model");
        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${OrderServices.tableName} (
            order_id uuid NOT NULL,
            service_id uuid NOT NULL,
            price NUMERIC DEFAULT 0.0
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${OrderServices.tableName}; `);
}

module.exports = {
    up,
    down
}
