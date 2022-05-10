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

            const product = await productDAO.insert(
                data = {
                    name: req.body.name,
                    description: req.body.description,
                    carMake: req.body.carMake,
                    carType: req.body.carType,
                    carYear: req.body.carYear,
                    carPart: req.body.carPart,
                }
            )

            // console.log(product);

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

            const updatedProducts = await productDAO.update(
                data= {
                    name: req.body.name,
                    description: req.body.description,
                    carMake: req.body.carMake,
                    carType: req.body.carType,
                    carYear: req.body.carYear,
                    carPart: req.body.carPart,
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
            let like = req.query.keyword ? req.query.keyword : undefined;
            let likeSupplier = req.query.supplierKeyword ? req.query.supplierKeyword : undefined;
            
            /// check if acc exists
            const products = await productDAO.find(
                where= {},
                options= {
                    limit: limit, 
                    skip: skip,
                    like: like,
                    likeSupplier: likeSupplier,
                }
            );

            const total = await productDAO.findCount(
                where= {},
                options= {
                    like: like,
                    likeSupplier: likeSupplier,
                }
            );

            // console.log(products);

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