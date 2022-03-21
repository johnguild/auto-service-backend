const Product = require('../product/product.model');

class Service {

    static tableName = 'services';

    static fromDB({
        id, 
        title, 
        description,
        is_public,
        price,
        discounted_price,
        cover,
        products,
        all_products = [],
    }) {
        const instance = new this({
            id, 
            title, 
            description,
            isPublic: is_public,
            price,
            discountedPrice: discounted_price,
            cover,
            products,
            allProducts: all_products.length > 0 
                ? all_products.map((p) => Product.fromDB(p))
                : [],
        });
        return instance;
    }

    
    constructor({ 
        id, 
        title, 
        description,
        isPublic,
        price,
        discountedPrice,
        cover,
        products,
        allProducts = [],
    }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.isPublic = isPublic;
        this.price = price;
        this.discountedPrice = discountedPrice;
        this.cover = cover;
        this.products = products;
        this.completeProducts = allProducts;

    }
    
}   

module.exports = Service