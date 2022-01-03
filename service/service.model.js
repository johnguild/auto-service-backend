
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
    }) {
        const instance = new this({
            id, 
            title, 
            description,
            isPublic: is_public,
            price,
            discountedPrice: discounted_price,
            cover,
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
    }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.isPublic = isPublic;
        this.price = price;
        this.discountedPrice = discountedPrice;
        this.cover = cover;
    }
    
}   

module.exports = Service