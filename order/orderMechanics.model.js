class OrderMechanic {

    static tableName = 'order_mechanics';

    static fromDB({
        id,
        order_id, 
        mechanic_id,
        full_name,
    }) {
        const instance = new this({
            id,
            orderId: order_id,
            mechanicId: mechanic_id,
            fullName: full_name,
        });
        return instance;
    }

    
    constructor({ 
        id,
        orderId,
        mechanicId,
        fullName,
    }) {
        this.id = id;
        this.orderId = orderId;
        this.mechanicId = mechanicId;
        this.fullName = fullName;
    }
    
}   

module.exports = OrderMechanic