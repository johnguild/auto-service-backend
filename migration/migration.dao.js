const Migration = require('./migration.model');
const { getPool } = require('../db/postgres');
const pool = getPool();

const createTable = async() => {
    return await pool
        .query(`CREATE TABLE IF NOT EXISTS ${Migration.tableName} (
            id uuid DEFAULT uuid_generate_v4 (),
            file_name varchar NOT NULL,
            PRIMARY KEY (id)
        );`);
}

const getAll = async() => {
    const res = await pool
        .query(`SELECT file_name FROM ${Migration.tableName}`);
    return res.rows.map((row) => row.file_name);
}

const getLast = async() => {
    const res = await pool
        .query(`SELECT file_name FROM ${Migration.tableName} ORDER BY file_name DESC LIMIT 1 ;`);
    return res.rows[0] ? res.rows[0].file_name : undefined;
}

const insert = async(fileName) => {
    return await pool
        .query(`INSERT INTO ${Migration.tableName} (file_name) VALUES('${fileName}');`);
}

const remove = async(fileName) => {
    return await pool
        .query(`DELETE FROM ${Migration.tableName} WHERE file_name='${fileName}';`);
}

module.exports = {
    createTable,
    getAll,
    getLast,
    insert,
    remove
}