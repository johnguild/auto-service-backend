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
        car_make,
        car_type,
        car_year,
        car_plate,
        car_odometer,
        working_days,
        created_at,
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
            carMake: car_make,
            carType: car_type,
            carYear: car_year,
            carPlate: car_plate,
            carOdometer: car_odometer,
            workingDays: working_days,
            createdAt: created_at,
            allServices: all_services.map((s) => OrderService.fromDB(s)),
            allProducts: all_products.map((p) => OrderProduct.fromDB(p)),
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
        carMake,
        carType,
        carYear,
        carPlate,
        carOdometer,
        workingDays,
        createdAt,
        allServices = [],
        allProducts = [],
        payments = [],
        customer,
    }) {
        this.id = id;
        this.customerId = customerId;
        this.total = total;
        this.installments = installments;
        this.completed = completed;
        this.carMake = carMake;
        this.carType = carType;
        this.carYear = carYear;
        this.carPlate = carPlate;
        this.carOdometer = carOdometer;
        this.workingDays = workingDays;
        this.createdAt = createdAt;
        this.payments = payments;
        this.customer = customer;
        this.services = [];


        // console.dir(allProducts, {depth: null});

        for (const service of allServices) {
            // console.log(service);
            const formattedService = {
                serviceId: service.serviceId,
                price: service.price,
                products: [],
            }

            for (const product of allProducts) {
                if (product.serviceId == service.serviceId) {
                    formattedService.products.push({
                        productId: product.productId,
                        price: product.price,
                    });
                }
            }
            this.services.push(formattedService);
        }
        

    }
    
}   

module.exports = Order