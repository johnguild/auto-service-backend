const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const productsValidation = require('./validations/products');
const productsIdValidation = require('./validations/products_id');
const getProductsValidation = require('./validations/get_products');
const getSearchProductsValidation = require('./validations/get_search_products');
const validationCheck = require('../middlewares/validationCheck');
const productDAO = require('./product.dao');
const Product = require('./product.model');
const User = require('../user/user.model');

const router = new express.Router();
const apiVersion = 'v1';


/**
 * Create a Product
 */
 router.post(`/${apiVersion}/products`, 
    api('Create a Product'),
    auth([User.ROLE_PERSONNEL]),
    productsValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            /// check if sku is available 
            const dupSKU = await productDAO.find(where = {
                sku: req.body.sku,
            });

            if (dupSKU.length > 0) {
                return req.api.status(400).errors([
                    'SKU already taken!'
                ]).send();
            }

            const product = await productDAO.insert(
                data = {
                    name: req.body.name,
                    sku: req.body.sku,
                    description: req.body.description,
                }
            )

            return req.api.status(200)
                .send(product);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }

    }
);



/**
 * Update a Product
 */
 router.post(`/${apiVersion}/products/:id`, 
    api('Update a Product'),
    auth([User.ROLE_PERSONNEL]),
    productsIdValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if product exists
            const products = await productDAO.find(where = {
                id: req.params.id,
            });

            if (products.length == 0) {
                return req.api.status(404).errors([
                    'Product Not Found!'
                ]).send();
            }

            const s = products[0];

            /// check if sku is available 
            const dupSKU = await productDAO.find(where = {
                sku: req.body.sku,
            });

            if (dupSKU.length > 0) {
                let alreadyTaken = false;
                dupSKU.forEach(prod => {
                    if (prod.id != s.id && prod.sku == req.body.sku) {
                        alreadyTaken = true;
                    }
                });
                if (alreadyTaken) {
                    return req.api.status(400).errors([
                        'SKU already taken!'
                    ]).send();
                }
            }

            const updatedProducts = await productDAO.update(
                data= {
                    name: req.body.name,
                    sku: req.body.sku,
                    description: req.body.description,
                },
                where= { id: s.id }
            )

            // console.log(updatedProducts);

            return req.api.status(200)
                .send(updatedProducts[0]);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);




/**
 * Get Product Listing
 */
 router.get(`/${apiVersion}/products`, 
    api('Get Product Listing'),
    auth([User.ROLE_PERSONNEL, User.ROLE_MANAGER]),
    getProductsValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            /// check if acc exists
            const products = await productDAO.find(
                where= {},
                options= {limit: limit, skip: skip}
            );

            const total = await productDAO.findCount(
                where= {}
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(products.length)
                .total(total)
                .send(products);

        } catch (error) {
            console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


/**
 * Get Product Search
 */
 router.get(`/${apiVersion}/products-search`, 
    api('Get Product Search'),
    auth([User.ROLE_PERSONNEL, User.ROLE_MANAGER]),
    getSearchProductsValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let keyword = req.query.keyword;
            
            /// check if acc exists
            const products = await productDAO.findLike(
                where= {
                    name: keyword,
                    sku: keyword,
                    description: keyword,
                },
                options= {limit: limit, skip: 0}
            );

            // console.log(total);

            return req.api.status(200)
                .send(products);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);

module.exports = router