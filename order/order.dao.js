const { getPool } = require('../db/postgres');
const pool = getPool();
const { toSnakeCase } = require('../utils/string');

const User = require('../user/user.model');
const Order = require('./order.model');
const OrderServices = require('./orderServices.model');
const OrderProducts = require('./orderProducts.model');
const OrderPayments = require('./orderPayments.model');



/**
 * Insert a new instance of Order
 * 
 * @param {*} data 
 * @returns {Order} Order?
 */
const insertOrder = async(
    data = { 
        customerId, 
        installments,
        total, 
        carMake,
        carType,
        carYear,
        carPlate,
        carOdometer,
        workingDays,
    }
) => {

    let text = `INSERT INTO ${Order.tableName} `;

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

    return res.rows.length > 0 ? Order.fromDB(res.rows[0]) : null;
}


/**
 * Insert a new instance of OrderServices
 * 
 * @param {*} data 
 * @returns {OrderServices} OrderServices?
 */
 const insertOrderService = async(
    data = {
        orderId, 
        serviceId, 
        price, 
    }
) => {

    let text = `INSERT INTO ${OrderServices.tableName} `;

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

    return res.rows.length > 0 ? OrderServices.fromDB(res.rows[0]) : null;
}


/**
 * Insert a new instance of OrderProducts
 * 
 * @param {*} data 
 * @returns {OrderProducts} OrderProducts?
 */
 const insertOrderProduct = async(
    data = {
        orderId, 
        serviceId,
        productId, 
        price, 
        quantity,
    }
) => {

    let text = `INSERT INTO ${OrderProducts.tableName} `;

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

    return res.rows.length > 0 ? OrderProducts.fromDB(res.rows[0]) : null;
}


/**
 * Insert a new instance of OrderPayments
 * 
 * @param {*} data 
 * @returns {OrderPayments} OrderPayments?
 */
 const insertOrderPayment = async(
    data = {
        orderId, 
        amount, 
        dateTime, 
    }
) => {

    let text = `INSERT INTO ${OrderPayments.tableName} `;

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

    return res.rows.length > 0 ? OrderPayments.fromDB(res.rows[0]) : null;
}


const find = async(
    where= {
        customerId,
        completed,
    },
    opt= {
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
        whereString += `o.${prefix}${col} = ${valueIndexes[ind]} `;
    });

    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }

    let optionString = ' ';
    if (opt != undefined) {
        if (opt.limit) {
            optionString += `LIMIT ${opt.limit} `;
        }

        if (opt.skip != undefined) {
            optionString += `OFFSET ${opt.skip} `;
        }
    }
     
    let text = `
        SELECT o.*, (SELECT json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 
                'email', u.email, 'mobile', u.mobile) as customer 
                FROM ${User.tableName} as u 
                WHERE u.id = o.customer_id 
            ) as customer, 
            CASE WHEN count(ss) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT ss.srv) END as all_services,
            CASE WHEN count(pr) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT pr.prdct) END as all_products,
            CASE WHEN count(py) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT py.pymnt) END as all_payments 
        FROM ${Order.tableName} as o 
        LEFT OUTER JOIN (
            SELECT s.order_id, jsonb_build_object('service_id', s.service_id, 
                'price', s.price) as srv  
            FROM ${OrderServices.tableName} as s 
        ) as ss ON ss.order_id = o.id 
        LEFT OUTER JOIN (
            SELECT p.order_id, jsonb_build_object('price', p.price, 'service_id', p.service_id, 
                'product_id', p.product_id, 'quantity', p.quantity) as prdct  
            FROM ${OrderProducts.tableName} as p 
        ) as pr ON pr.order_id = o.id 
        LEFT OUTER JOIN (
            SELECT p.order_id, jsonb_build_object('amount', p.amount, 
                'date_time', p.date_time) as pymnt  
            FROM ${OrderPayments.tableName} as p 
        ) as py ON py.order_id = o.id 
        ${whereString} `;
    text += 'GROUP BY o.id ';
    text += 'ORDER BY o.completed ASC ';
    text += `${optionString} ;`;

        
    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    // console.dir(res.rows, {depth: null});

    return res.rows.length > 0 ? 
        res.rows.map(u => Order.fromDB(u)) : [];
}



const findCount = async(
    where = {
        customerId,
        completed,
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
        whereString += `o.${prefix}${col} = ${valueIndexes[ind]} `;
    });

    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }
     
    let text = `
        SELECT COUNT(*) as total 
        FROM ${Order.tableName} as o 
        ${whereString};`;

        
    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    // console.dir(res.rows, {depth: null});

    return res.rows.length > 0 ? res.rows[0].total : 0;
}

module.exports = {
    insertOrder,
    insertOrderService,
    insertOrderProduct,
    insertOrderPayment,
    // update,
    find,
    findCount
}