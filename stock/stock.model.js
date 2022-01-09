
class Stock {

    static tableName = 'stocks';

    static fromDB({
        id, 
        name,
        sku,
        description,
        stock,
        price,
    }) {
        const instance = new this({
            id,  
            name,
            sku,
            description,
            stock,
            price,
        });
        return instance;
    }

    
    constructor({ 
        id,  
        name,
        sku,
        description,
        stock,
        price,
    }) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.stock = stock;
        this.price = price;
    }
    
}   

module.exports = Stock