const { getPool } = require('../db/postgres');
const pool = getPool();

const { toSnakeCase } = require('../utils/string');
const Cash = require('./cash.model');



/**
 * Insert a new instance of Cash
 * 
 * @param {*} data 
 * @returns {Cash} Cash?
 */
const insert = async(
    data = {
        amount,
        purpose,
    }
) => {

    let text = `INSERT INTO ${Cash.tableName} `;

    const columns = [], values = [], valueIndexes = [];
    /// collect all variables need to build the query
    let i = 1;
    for (const attr in data) {
        if (data[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(data[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    // end text
    text += `(${columns.toString()}) 
        VALUES (${valueIndexes.toString()}) 
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? Cash.fromDB(res.rows[0]) : null;
}

/**
 * Updates an instance of Cash
 * 
 * @param {*} data 
 * @param {*} where 
 * @returns {Cash} Array of Cash
 */
const update = async(
    data = {
        amount,
        purpose,
    }, 
    where = {
        id,
    }
) => {

    /// collect all variables need to build the query
    const columns = [], wColumns = [], values = [], valueIndexes = [];
    let i = 1;
    for (const attr in data) {
        if (data[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(data[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    for (const attr in where) {
        if (where[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            wColumns.push(snakedAttr);
            values.push(where[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    let valuIndexPos = 0;
    let updateString = ' ';
    columns.forEach((col, ind) => {
        updateString += ` ${col} = ${valueIndexes[ind]} ,`;
        valuIndexPos = ind;
    });

    if(updateString.charAt(updateString.length-1) == ',') {
        updateString = updateString.slice(0, -1);
    }

    let whereString = ' ';
    wColumns.forEach((col, ind) => {
        let prefix = ind > 0 ? 'AND ' : ''; 
        whereString += `${prefix}${col} = ${valueIndexes[valuIndexPos + ind + 1]} `;
    });
     
    const text = `
        UPDATE ${Cash.tableName} 
        SET ${updateString} 
        WHERE ${whereString}
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Cash.fromDB(u)) : [];
}


const find = async(
    where = {
        id,
    },
    options = {
        limit: undefined,
        skip: undefined,
    }
) => {

    /// collect all variables need to build the query
    const columns = [], values = [], valueIndexes = [];
    let i = 1;
    for (const attr in where) {
        if (where[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(where[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    let whereString = ' ';
    columns.forEach((col, ind) => {
        let prefix = ind > 0 ? 'AND ' : ''; 
        whereString += `${prefix}${col} = ${valueIndexes[ind]} `;
    });

    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }

    let optionString = ' ';
    if (options != undefined) {
        if (options.limit) {
            optionString += `LIMIT ${options.limit} `;
        }

        if (options.skip) {
            optionString += `OFFSET ${options.skip} `;
        }
    }
     
    const text = `
        SELECT * FROM ${Cash.tableName} 
        ${whereString} 
        ${optionString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Cash.fromDB(u)) : [];

}


const findCount = async(
    where = {
        id,
        amount,
    }
) => {

    /// collect all variables need to build the query
    const columns = [], values = [], valueIndexes = [];
    let i = 1;
    for (const attr in where) {
        if (where[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(where[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    let whereString = ' ';
    columns.forEach((col, ind) => {
        let prefix = ind > 0 ? 'AND ' : ''; 
        whereString += `${prefix}${col} = ${valueIndexes[ind]} `;
    });

    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }

    const text = `
        SELECT COUNT(*) as total 
        FROM ${Cash.tableName} 
        ${whereString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    // console.log(res.rows);

    return res.rows.length > 0 ? res.rows[0].total : 0;

}


const findTotal = async() => {

    const text = `SELECT COALESCE(SUM(amount), 0) as total FROM ${Cash.tableName};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text });

    // console.log(res);
    return res.rows.length > 0 ? res.rows[0].total : 0.0;

}

module.exports = {
    insert,
    update,
    find,
    findCount,
    findTotal
}