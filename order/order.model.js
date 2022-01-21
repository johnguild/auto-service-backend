
class Order {

    static tableName = 'orders';

    static fromDB({
        id, 
        customer_id,
        total,
        installments,
        completed,
    }) {
        const instance = new this({
            id,  
            customerId: customer_id,
            total,
            installments,
            completed,
        });
        return instance;
    }

    
    constructor({ 
        id,  
        customerId,
        total,
        installments,
        completed,
    }) {
        this.id = id;
        this.customerId = customerId;
        this.total = total;
        this.installments = installments;
        this.completed = completed;
    }
    
}   

module.exports = Order