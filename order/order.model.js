const User = require('../user/user.model');
const OrderPayment = require("./orderPayments.model");
const OrderProduct = require("./orderProducts.model");
const OrderService = require("./orderServices.model");
const OrderMechanic = require("./orderMechanics.model");

class Order {

    static tableName = 'orders';

    static fromDB({
        id, 
        customer_id,
        total,
        completed,
        car_make,
        car_type,
        car_year,
        car_plate,
        car_odometer,
        receive_date,
        warranty_end,
        created_at,
        all_services = [],
        all_products = [],
        all_payments = [],
        all_mechanics = [],
        customer,
    }) {
        const instance = new this({
            id,  
            customerId: customer_id,
            total,
            completed,
            carMake: car_make,
            carType: car_type,
            carYear: car_year,
            carPlate: car_plate,
            carOdometer: car_odometer,
            receiveDate: receive_date,
            warrantyEnd: warranty_end,
            createdAt: created_at,
            allServices: all_services.map((s) => OrderService.fromDB(s)),
            allProducts: all_products.map((p) => OrderProduct.fromDB(p)),
            payments: all_payments.map((p) => OrderPayment.fromDB(p)),
            mechanics: all_mechanics.map((p) => OrderMechanic.fromDB(p)),
            customer: User.fromDB({ ...customer }),
        });
        return instance;
    }

    
    constructor({ 
        id,  
        customerId,
        total,
        completed,
        carMake,
        carType,
        carYear,
        carPlate,
        carOdometer,
        receiveDate,
        warrantyEnd,
        createdAt,
        allServices = [],
        allProducts = [],
        payments = [],
        mechanics = [],
        customer,
    }) {
        this.id = id;
        this.customerId = customerId;
        this.total = total;
        this.completed = completed;
        this.carMake = carMake;
        this.carType = carType;
        this.carYear = carYear;
        this.carPlate = carPlate;
        this.carOdometer = carOdometer;
        this.receiveDate = receiveDate;
        this.warrantyEnd = warrantyEnd;
        this.createdAt = createdAt;
        this.payments = payments;
        this.mechanics = mechanics;
        this.customer = customer;
        this.services = [];
        this.laborTotal = 0;
        this.partsTotal = 0;
        this.paymentsTotal = 0;


        // console.dir(allProducts, {depth: null});
        // let newTotal = 0;
        for (const service of allServices) {
            // console.log(service);
            const formattedService = {
                serviceId: service.serviceId,
                price: service.price,
                title: service.title,
                products: [],
            }

            this.laborTotal += parseFloat(service.price);
            // newTotal += parseFloat(service.price);

            for (const product of allProducts) {
                if (product.serviceId == service.serviceId) {
                    formattedService.products.push({
                        productId: product.productId,
                        price: product.price,
                        quantity: product.quantity,
                        name: product.name,
                    });
                    this.partsTotal += (parseInt(product.quantity) * parseFloat(product.price));
                    // newTotal += (parseFloat(product.price) * parseFloat(product.quantity));
                }
            }
            this.services.push(formattedService);


            // let newTotalPayment = parseFloat(downPayment);
            // for (const pm of payments) {
            //     newTotalPayment += parseFloat(pm.amount);
            // }

            // // custom values
            // this.total = newTotal;
            // this.totalPayment = newTotalPayment;
        }
        
        for (const payment of payments) {
            this.paymentsTotal += parseFloat(payment.amount);
        }

    }
    
}   

module.exports = Order