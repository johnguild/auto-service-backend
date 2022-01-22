const User = require('../user/user.model');
const OrderPayment = require("./orderPayments.model");
const OrderProduct = require("./orderProducts.model");
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
        all_products = [],
        all_payments = [],
        customer,
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
            products: all_products.map((p) => OrderProduct.fromDB(p)),
            payments: all_payments.map((p) => OrderPayment.fromDB(p)),
            customer: User.fromDB({ ...customer }),
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
        products = [],
        payments = [],
        customer,
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
        this.products = products;
        this.payments = payments;
        this.customer = customer;
    }
    
}   

module.exports = Order