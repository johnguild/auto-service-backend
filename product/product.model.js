
class Product {

    static tableName = 'products';

    static fromDB({
        id, 
        name,
        sku,
        description,
    }) {
        const instance = new this({
            id,  
            name,
            sku,
            description,
        });
        return instance;
    }

    
    constructor({ 
        id,  
        name,
        sku,
        description,
    }) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.description = description;
    }
    
}   

module.exports = Product