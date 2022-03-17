
class Cash {

    static tableName = 'cashes';

    static fromDB({
        id, 
        amount, 
        purpose,
        created_at
    }) {
        const user = new this({
            id, 
            amount,
            purpose,
            createdAt: created_at,
        });
        return user;
    }
    
    constructor({ 
        id, 
        amount,
        purpose,
        createdAt,
    }) {
        this.id = id;
        this.amount = amount;
        this.purpose = purpose;
        this.createdAt = createdAt;
    }
    

}   

module.exports = Cash