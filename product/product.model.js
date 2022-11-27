const Stock = require('../stock/stock.model');
const ProductArchive = require('./product_archive.model');


class Product {

    static tableName = 'products';
    
    static ORDER_BY_NAME_ASC = 'nameAsc';
    static ORDER_BY_NAME_DESC =  'nameDesc';
    static ORDER_BY_DESCRIPTION_ASC = 'descriptionAsc';
    static ORDER_BY_DESCRIPTION_DESC = 'descriptionDesc';

    static fromDB({
        id, 
        name,
        description, 
        car_make,
        car_type,
        car_year,
        car_part,
        stocks = [],
        archives = [],
    }) {
        const instance = new this({
            id,  
            name,
            description,
            carMake: car_make,
            carType: car_type,
            carYear: car_year,
            carPart: car_part,
            stocks: stocks.length > 0 
                ? stocks.map((s) => Stock.fromDB(s))
                : [],
            archiveRequest: archives.length > 0 
                ? ProductArchive.fromDB(archives[0])
                : null, 
        });
        return instance;
    }

    
    constructor({ 
        id,  
        name,
        description,
        carMake,
        carType,
        carYear,
        carPart,
        stocks = [],
        archiveRequest,
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.carMake = carMake;
        this.carType = carType;
        this.carYear = carYear;
        this.carPart = carPart;
        this.stocks = stocks;
        this.totalStocks = 0;
        this.archiveRequest = archiveRequest;

        stocks.forEach((s) => {
            this.totalStocks += parseInt(s.quantity);
        });
    }
    
}   

module.exports = Product