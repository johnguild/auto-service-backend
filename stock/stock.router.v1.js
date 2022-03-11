const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const stocksValidation = require('./validations/stocks');
const stocksIdValidation = require('./validations/stocks_id');
const getStocksValidation = require('./validations/get_stocks');
const validationCheck = require('../middlewares/validationCheck');
const productDAO = require('../product/product.dao');
const stockDAO = require('./stock.dao');
const Stock = require('./stock.model');
const User = require('../user/user.model');

const router = new express.Router();
const apiVersion = 'v1';


/**
 * Create a Stock
 */
 router.post(`/${apiVersion}/stocks`, 
    api('Create a Stock'),
    auth([User.ROLE_PERSONNEL]),
    stocksValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            /// check if product exists 
            const products = await productDAO.find(where = {
                id: req.body.productId
            });

            if (products.length == 0) {
                return req.api.status(400).errors([
                    'Product does not exists'
                ]).send();
            }

            const stock = await stockDAO.insert(
                data = {
                    productId: products[0].id,
                    personnelId: req.user.id,
                    supplier: req.body.supplier,
                    quantity: req.body.quantity,
                    unitPrice: req.body.unitPrice,
                    sellingPrice: req.body.sellingPrice,
                }
            )

            return req.api.status(200)
                .send(stock);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }

    }
);



/**
 * Update a Stock
 */
 router.post(`/${apiVersion}/stocks/:id`, 
    api('Update a Stock'),
    auth([User.ROLE_PERSONNEL]),
    stocksIdValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if stock exists
            const stocks = await stockDAO.find(where = {
                id: req.params.id,
            });

            if (stocks.length == 0) {
                return req.api.status(404).errors([
                    'Stock Not Found!'
                ]).send();
            }

            const s = stocks[0];

            const updatedStocks = await stockDAO.update(
                data= {
                    supplier: req.body.supplier,
                    quantity: req.body.quantity,
                    unitPrice: req.body.unitPrice,
                    sellingPrice: req.body.sellingPrice,
                },
                where= { id: s.id }
            )
            // console.log(updatedStocks);

            return req.api.status(200)
                .send(updatedStocks[0]);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);




/**
 * Get Stock Listing
 */
 router.get(`/${apiVersion}/stocks`, 
    api('Get Stock Listing'),
    auth([User.ROLE_PERSONNEL, User.ROLE_MANAGER]),
    getStocksValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            // console.log(req.query);
            /// check if acc exists
            const stocks = await stockDAO.find(
                where= {
                    productId: req.query.productId,
                },
                options= {limit: limit, skip: skip}
            );

            const total = await stockDAO.findCount(
                where= {
                    productId: req.query.productId
                }
            );
            
            // console.log(stocks);
            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(stocks.length)
                .total(total)
                .send(stocks);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);

module.exports = router