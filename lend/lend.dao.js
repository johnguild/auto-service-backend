const { getPool } = require('../db/postgres');
const pool = getPool();

const { toSnakeCase } = require('../utils/string');
const Lend = require('./lend.model');
const Mechanic = require('../mechanic/mechanic.model');
const Tool = require('../tool/tool.model');

/**
 * Insert a new instance of Lend
 * 
 * @param {*} data 
 * @returns {Lend} Lend?
 */
const insert = async(
    data = {
        toolId,
        mechanicId,
        quantity,
        borrowedAt,
        remarks, 
    }
) => {

    let text = `INSERT INTO ${Lend.tableName} `;

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

    return res.rows.length > 0 ? Lend.fromDB(res.rows[0]) : null;
}

/**
 * Updates an instance of Lend
 * 
 * @param {*} data 
 * @param {*} where 
 * @returns {Lend} Array of Lend
 */
const update = async(
    data = {
        quantity,
        remittedAt,
        remarks, 
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
        UPDATE ${Lend.tableName} 
        SET ${updateString} 
        WHERE ${whereString}
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Lend.fromDB(u)) : [];
}


const find = async(
    where = {
        id,
        toolId,
        mechanicId
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
        whereString += `s.${prefix}${col} = ${valueIndexes[ind]} `;
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
        SELECT s.*, (SELECT json_build_object('id', m.id, 'first_name', m.first_name, 'last_name', m.last_name 
                ) as mechanic  
                FROM ${Mechanic.tableName} as m 
                WHERE m.id = s.mechanic_id 
            ) as mechanic,  
            (SELECT json_build_object('id', t.id, 'name', t.name, 'description', t.description 
                ) as tool   
                FROM ${Tool.tableName} as t 
                WHERE t.id = s.tool_id  
            ) as tool   
        FROM ${Lend.tableName} as s 
        ${whereString} 
        GROUP BY s.id 
        ORDER BY s.borrowed_at DESC 
        ${optionString} ;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    // console.dir(res.rows, {depth: null});

    return res.rows.length > 0 ? 
        res.rows.map(u => Lend.fromDB(u)) : [];

}


const findCount = async(
    where = {
        id,
        toolId,
        mechanicId,
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
        FROM ${Lend.tableName} 
        ${whereString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? res.rows[0].total : 0;

}


module.exports = {
    insert,
    update,
    find,
    findCount
}