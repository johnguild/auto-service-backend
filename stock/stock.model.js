
class Stock {

    static tableName = 'stocks';

    static fromDB({
        id, 
        product_id,
        personnel_id,
        supplier,
        quantity,
        unit_price,
        selling_price,
        created_at,
    }) {
        const instance = new this({
            id,  
            productId: product_id,
            personnelId: personnel_id,
            supplier,
            quantity,
            unitPrice: unit_price,
            sellingPrice: selling_price,
            createdAt: created_at,
        });
        return instance;
    }

    
    constructor({ 
        id,  
        productId,
        personnelId,
        supplier,
        quantity,
        unitPrice,
        sellingPrice,
        createdAt,
    }) {
        this.id = id;
        this.productId = productId;
        this.personnelId = personnelId;
        this.supplier = supplier;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.sellingPrice = sellingPrice;
        this.createdAt = createdAt;
    }
    
}   

module.exports = Stock