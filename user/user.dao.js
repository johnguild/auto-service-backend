const { getPool } = require('../db/postgres');
const pool = getPool();

const { toSnakeCase } = require('../utils/string');
const User = require('./user.model');
const Order = require('../order/order.model');



/**
 * Insert a new instance of User
 * 
 * @param {*} data 
 * @returns {User} User?
 */
const insert = async(
    data = {
        email, 
        mobile, 
        password, 
        firstName, 
        lastName, 
        gender, 
        birthDay,
        role,
        companyName,
        companyNumber,
        companyAddress,
        companyTin,
    }
) => {

    let text = `INSERT INTO ${User.tableName} `;

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

    return res.rows.length > 0 ? User.fromDB(res.rows[0]) : null;
}

/**
 * Updates an instance of User
 * 
 * @param {*} data 
 * @param {*} where 
 * @returns {User} Array of User
 */
const update = async(
    data = {
        email, 
        mobile, 
        password, 
        firstName, 
        lastName, 
        gender, 
        birthDay,
        isDisabled,
        companyName,
        companyNumber,
        companyAddress,
        companyTin,
    }, 
    where = {
        id,
        email, 
        mobile,
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
        UPDATE ${User.tableName} 
        SET ${updateString} 
        WHERE ${whereString}
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => User.fromDB(u)) : [];
}

const find = async(
    where = {
        id,
        email,
        mobile,
        role,
        isDisabled,
        companyName,
        companyNumber,
        companyAddress,
        companyTin,
    },
    options = {
        limit: undefined,
        skip: undefined,
        like: undefined,
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


    if (options.like) {
        if (whereString.trim() != '') {
            whereString += ` AND `;
        }
        whereString += `  
            (email ILIKE $${values.length + 1} OR 
             mobile ILIKE $${values.length + 1} OR 
             first_name ILIKE $${values.length + 1} OR 
             last_name ILIKE $${values.length + 1} OR 
             company_name ILIKE $${values.length + 1})
        `;
        values.push(`%${options.like}%`);
    }


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
        SELECT * FROM ${User.tableName} 
        ${whereString} 
        ${optionString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => User.fromDB(u)) : [];

}

const findCount = async(
    where = {
        id,
        email,
        mobile,
        role,
        isDisabled,
        companyName,
        companyNumber,
        companyAddress,
        companyTin,
    },
    options = {
        like: undefined,
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


    if (options.like) {
        if (whereString.trim() != '') {
            whereString += ` AND `;
        }
        whereString += `  
            (email ILIKE $${values.length + 1} OR 
             mobile ILIKE $${values.length + 1} OR 
             first_name ILIKE $${values.length + 1} OR 
             last_name ILIKE $${values.length + 1} OR 
             company_name ILIKE $${values.length + 1})
        `;
        values.push(`%${options.like}%`);
    }

    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }

    const text = `
        SELECT COUNT(*) as total 
        FROM ${User.tableName} 
        ${whereString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    // console.log(res.rows);

    return res.rows.length > 0 ? res.rows[0].total : 0;

}

const findCustomer = async(
    where = {
        id,
        email,
        mobile,
        isDisabled,
        companyName,
        companyNumber,
        companyAddress,
        companyTin,
    },
    options = {
        limit: undefined,
        skip: undefined,
        like: undefined,
        plateNos: undefined, 
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

    /// add specific role
    whereString += `u.role = '${User.ROLE_CUSTOMER}' `;

    columns.forEach((col, ind) => {
        let prefix = ind > 0 ? 'AND ' : ''; 
        whereString += `${prefix}u.${col} = ${valueIndexes[ind]} `;
    });


    if (options.like) {
        if (whereString.trim() != '') {
            whereString += ` AND `;
        }
        whereString += `  
            (u.email ILIKE $${values.length + 1} OR 
             u.mobile ILIKE $${values.length + 1} OR 
             u.first_name ILIKE $${values.length + 1} OR 
             u.last_name ILIKE $${values.length + 1} OR 
             u.company_name ILIKE $${values.length + 1})
        `;
        values.push(`%${options.like}%`);
    }

    if (options && options.plateNos) {
        whereString += `AND EXISTS (
            SELECT 1 FROM ${Order.tableName} as o   
                WHERE o.customer_id = u.id
                    AND o.car_plate ILIKE $${values.length + 1} 
        ) `;
        values.push(`%${options.plateNos}%`);
    }


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
        SELECT * FROM ${User.tableName} as u  
        ${whereString} 
        ${optionString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => User.fromDB(u)) : [];

}


const findCustomerCount = async(
    where = {
        id,
        email,
        mobile,
        isDisabled,
        companyName,
        companyNumber,
        companyAddress,
        companyTin,
    },
    options = {
        like: undefined,
        plateNos: undefined, 
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

    /// add specific role
    whereString += `u.role = '${User.ROLE_CUSTOMER}' `;

    columns.forEach((col, ind) => {
        let prefix = ind > 0 ? 'AND ' : ''; 
        whereString += `${prefix}u.${col} = ${valueIndexes[ind]} `;
    });


    if (options.like) {
        if (whereString.trim() != '') {
            whereString += ` AND `;
        }
        whereString += `  
            (u.email ILIKE $${values.length + 1} OR 
             u.mobile ILIKE $${values.length + 1} OR 
             u.first_name ILIKE $${values.length + 1} OR 
             u.last_name ILIKE $${values.length + 1} OR 
             u.company_name ILIKE $${values.length + 1})
        `;
        values.push(`%${options.like}%`);
    }

    if (options && options.plateNos) {
        whereString += `AND EXISTS (
            SELECT 1 FROM ${Order.tableName} as o   
                WHERE o.customer_id = u.id
                    AND o.car_plate ILIKE $${values.length + 1} 
        ) `;
        values.push(`%${options.plateNos}%`);
    }


    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }
     
    const text = `
        SELECT COUNT(*) as total 
        FROM ${User.tableName} as u 
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
    findCount,
    findCustomer, 
    findCustomerCount, 
}