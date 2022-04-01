
class Tool {

    static tableName = 'tools';

    static fromDB({
        id, 
        name, 
        description,
        quantity,
        available,
        cover,
    }) {
        const instance = new this({
            id, 
            name, 
            description,
            quantity,
            available,
            cover
        });
        return instance;
    }

    
    constructor({ 
        id, 
        name,
        description,
        quantity,
        available,
        cover,
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.available = available;
        this.cover = cover;

    }
    
}   

module.exports = Tool