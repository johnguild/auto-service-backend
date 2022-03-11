const { getPool } = require('../db/postgres');
const pool = getPool();
const OrderMechanic = require('../order/orderMechanics.model.js');

        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${OrderMechanic.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            order_id uuid NOT NULL,
            mechanic_id uuid NOT NULL,
            PRIMARY KEY(id)
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${OrderMechanic.tableName}; `);
}

module.exports = {
    up,
    down
}
