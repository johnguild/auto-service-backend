const { getPool } = require('../db/postgres');
const pool = getPool();

const { toSnakeCase } = require('../utils/string');
const Service = require('./service.model');



/**
 * Insert a new instance of Service
 * 
 * @param {*} data 
 * @returns {Service} Service?
 */
const insert = async(
    data = {
        title,
        description,
        price,
        discountedPrice,
        cover, 
        isPublic,
    }
) => {

    let text = `INSERT INTO ${Service.tableName} `;

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

    return res.rows.length > 0 ? Service.fromDB(res.rows[0]) : null;
}

/**
 * Updates an instance of Service
 * 
 * @param {*} data 
 * @param {*} where 
 * @returns {Service} Array of Service
 */
const update = async(
    data = {
        title,
        description,
        price,
        discountedPrice,
        cover, 
        isPublic,
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
        UPDATE ${Service.tableName} 
        SET ${updateString} 
        WHERE ${whereString}
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Service.fromDB(u)) : [];
}


const find = async(
    where = {
        id,
        title,
        description,
        price,
        discountedPrice,
        isPublic,
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
        SELECT * FROM ${Service.tableName} 
        WHERE ${whereString} 
        ${optionString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Service.fromDB(u)) : [];

}


module.exports = {
    insert,
    update,
    find
}