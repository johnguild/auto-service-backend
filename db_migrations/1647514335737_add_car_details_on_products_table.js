const { getPool } = require('../db/postgres');
const pool = getPool();
const Product = require('../product/product.model.js');

        
const up = async() => {
    return await pool
        .query(`
            ALTER TABLE ${Product.tableName} 
                ADD COLUMN IF NOT EXISTS car_make VARCHAR;
            ALTER TABLE ${Product.tableName} 
                ADD COLUMN IF NOT EXISTS car_type VARCHAR;
            ALTER TABLE ${Product.tableName} 
                ADD COLUMN IF NOT EXISTS car_year VARCHAR;
            ALTER TABLE ${Product.tableName} 
                ADD COLUMN IF NOT EXISTS car_part VARCHAR;
        `);
}

const down = async() => {
    return await pool
        .query(`
            ALTER TABLE ${Product.tableName} 
                DROP COLUMN IF EXISTS car_make;
            ALTER TABLE ${Product.tableName} 
                DROP COLUMN IF EXISTS car_type;
            ALTER TABLE ${Product.tableName} 
                DROP COLUMN IF EXISTS car_year;
            ALTER TABLE ${Product.tableName} 
                DROP COLUMN IF EXISTS car_part;
        `);
}

module.exports = {
    up,
    down
}
