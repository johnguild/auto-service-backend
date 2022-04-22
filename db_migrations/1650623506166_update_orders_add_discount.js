const { getPool } = require('../db/postgres');
const pool = getPool();
const Order = require('../order/order.model.js');

        
const up = async() => {
    return await pool
        .query(`
            ALTER TABLE ${Order.tableName}
                ADD COLUMN discount NUMERIC DEFAULT 0.0,
                ADD COLUMN sub_total NUMERIC DEFAULT 0.0;
        `);
}

const down = async() => {
    return await pool
        .query(`
            ALTER TABLE ${Order.tableName}
                DROP COLUMN IF EXISTS discount,
                DROP COLUMN IF EXISTS sub_total;
        `);
}

module.exports = {
    up,
    down
}
