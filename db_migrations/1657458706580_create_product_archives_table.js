const { getPool } = require('../db/postgres');
const pool = getPool();
const ProductArchive = require('../product/product_archive.model.js');

        
const up = async() => {
    return await pool
        .query(`CREATE TABLE ${ProductArchive.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            product_id uuid NOT NULL,
            requested_by uuid NOT NULL,
            requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            requested_comment VARCHAR,
            declined_by uuid, 
            declined_at TIMESTAMPTZ, 
            approved_by uuid,
            approved_at TIMESTAMPTZ, 
            PRIMARY KEY(id)
        );`);
}

const down = async() => {
    return await pool
        .query(`DROP TABLE IF EXISTS ${ProductArchive.tableName}; `);
}

module.exports = {
    up,
    down
}
