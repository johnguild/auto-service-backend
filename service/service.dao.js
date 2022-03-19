const { getPool } = require('../db/postgres');
const pool = getPool();

const { toSnakeCase } = require('../utils/string');
const Service = require('./service.model');
const Product = require('../product/product.model');
const Stock = require('../stock/stock.model');



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
        products,
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
        products,
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
        SELECT s.*, 
            CASE WHEN count(pr) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT pr.prdct) END as all_products 
        FROM ${Service.tableName} as s
        LEFT OUTER JOIN (
            SELECT p.id, 
            jsonb_build_object('id', p.id, 'name', p.name, 'sku', p.sku, 
                'description', p.description, 'car_make', p.car_make, 'car_type', p.car_type, 
                'car_year', p.car_year, 'car_part', p.car_part, 'stocks', 
                CASE WHEN count(ss) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT ss.stock) END
                ) as prdct  
            FROM ${Product.tableName} as p 
            LEFT OUTER JOIN (
                SELECT s.product_id, jsonb_build_object('id', s.id, 'quantity', s.quantity, 
                    'supplier', s.supplier, 'unit_price', s.unit_price, 'selling_price', s.selling_price) 
                    as stock  
                FROM ${Stock.tableName} as s 
                WHERE s.quantity > 0  
            ) as ss ON ss.product_id = p.id 
            GROUP BY p.id  
        ) as pr ON pr.id = any(s.products)  
        ${whereString} 
        GROUP BY s.id
        ${optionString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    // console.dir(res.rows, {depth: null});

    return res.rows.length > 0 ? 
        res.rows.map(u => Service.fromDB(u)) : [];

}


const findCount = async(
    where = {
        id,
        title,
        description,
        price,
        discountedPrice,
        isPublic,
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
        FROM ${Service.tableName} 
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