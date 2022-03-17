const Stock = require('../stock/stock.model');


class Product {

    static tableName = 'products';

    static fromDB({
        id, 
        name,
        sku,
        description, 
        car_make,
        car_type,
        car_year,
        car_part,
        stocks = []
    }) {
        const instance = new this({
            id,  
            name,
            sku,
            description,
            carMake: car_make,
            carType: car_type,
            carYear: car_year,
            carPart: car_part,
            stocks: stocks.map((s) => Stock.fromDB(s)),
        });
        return instance;
    }

    
    constructor({ 
        id,  
        name,
        sku,
        description,
        carMake,
        carType,
        carYear,
        carPart,
        stocks = [],
    }) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.carMake = carMake;
        this.carType = carType;
        this.carYear = carYear;
        this.carPart = carPart;
        this.stocks = stocks;
        this.totalStocks = 0;

        stocks.forEach((s) => {
            this.totalStocks+= s.quantity;
        });
    }
    
}   

module.exports = Product