
class Cash {

    static tableName = 'cashes';

    static fromDB({
        id, 
        amount, 
        created_at
    }) {
        const user = new this({
            id, 
            amount,
            createdAt: created_at,
        });
        return user;
    }
    
    constructor({ 
        id, 
        amount,
        createdAt,
    }) {
        this.id = id;
        this.amount = amount;
        this.createdAt = createdAt;
    }
    

}   

module.exports = Cash