
const OrderPayment = require("./orderPayments.model");
const OrderService = require("./orderServices.model");

class Order {

    static tableName = 'orders';

    static fromDB({
        id, 
        customer_id,
        total,
        installments,
        completed,
        car_brand,
        car_model,
        car_color,
        car_plate,
        all_services = [],
        all_payments = [],
    }) {
        const instance = new this({
            id,  
            customerId: customer_id,
            total,
            installments,
            completed,
            carBrand: car_brand,
            carModel: car_model,
            carColor: car_color,
            carPlate: car_plate,
            services: all_services.map((s) => OrderService.fromDB(s)),
            payments: all_payments.map((p) => OrderPayment.fromDB(p)),
        });
        return instance;
    }

    
    constructor({ 
        id,  
        customerId,
        total,
        installments,
        completed,
        carBrand,
        carModel,
        carColor,
        carPlate,
        services = [],
        payments = [],
    }) {
        this.id = id;
        this.customerId = customerId;
        this.total = total;
        this.installments = installments;
        this.completed = completed;
        this.carBrand = carBrand;
        this.carModel = carModel;
        this.carColor = carColor;
        this.carPlate = carPlate;
        this.services = services;
        this.payments = payments;
    }
    
}   

module.exports = Order