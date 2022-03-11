const Stock = require('../stock/stock.model');


class Product {

    static tableName = 'products';

    static fromDB({
        id, 
        name,
        sku,
        description, 
        stocks = []
    }) {
        const instance = new this({
            id,  
            name,
            sku,
            description,
            stocks: stocks.map((s) => Stock.fromDB(s)),
        });
        return instance;
    }

    
    constructor({ 
        id,  
        name,
        sku,
        description,
        stocks = [],
    }) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.stocks = stocks;
        this.totalStocks = 0;

        stocks.forEach((s) => {
            this.totalStocks+= s.quantity;
        });
    }
    
}   

module.exports = Product