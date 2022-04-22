const { getPool } = require('../db/postgres');
const pool = getPool();

const { toSnakeCase } = require('../utils/string');
const Stock = require('./stock.model');



/**
 * Insert a new instance of Stock
 * 
 * @param {*} data 
 * @returns {Stock} Stock?
 */
const insert = async(
    data = {
        productId,
        personnelId,
        supplier,
        quantity,
        unitPrice,
        sellingPrice,
    }
) => {

    let text = `INSERT INTO ${Stock.tableName} `;

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

    return res.rows.length > 0 ? Stock.fromDB(res.rows[0]) : null;
}

/**
 * Updates an instance of Stock
 * 
 * @param {*} data 
 * @param {*} where 
 * @returns {Stock} Array of Stock
 */
const update = async(
    data = {        
        supplier,
        quantity,
        unitPrice,
        sellingPrice,
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
        UPDATE ${Stock.tableName} 
        SET ${updateString} 
        WHERE ${whereString}
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Stock.fromDB(u)) : [];
}


const find = async(
    where = {
        id,    
        productId,
        personnelId,
        supplier,
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
        SELECT * FROM ${Stock.tableName} 
        ${whereString} 
        ORDER BY created_at DESC 
        ${optionString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Stock.fromDB(u)) : [];

}


const findLike = async(
    where = { 
        supplier,
        quantity,
        unitPrice,
        sellingPrice,
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
            values.push(`%${where[attr]}%`);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    let whereString = ' ';
    columns.forEach((col, ind) => {
        let prefix = ind > 0 ? 'OR ' : ''; 
        whereString += `${prefix}${col} ILIKE ${valueIndexes[ind]} `;
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
        SELECT * FROM ${Stock.tableName} 
        ${whereString} 
        ${optionString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Stock.fromDB(u)) : [];

}

const findCount = async(
    where = {
        id,    
        productId,
        personnelId,
        supplier,
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
        FROM ${Stock.tableName} 
        ${whereString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? res.rows[0].total : 0;

}

const findTotalQuantity = async(
    where = {
        productId,
    }
) => {

    const text = `
        SELECT COALESCE(SUM(quantity), 0) as total FROM ${Stock.tableName} 
        WHERE product_id = '${where.productId}' 
            AND quantity > 0;`;


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
    findLike,
    findCount,
    findTotalQuantity,
}