const User = require('../user/user.model');
const OrderPayment = require("./orderPayments.model");
const OrderProduct = require("./orderProducts.model");
const OrderService = require("./orderServices.model");
const OrderMechanic = require("./orderMechanics.model");

class OrderEdit {

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
        discount,
        sub_total,
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
            allProducts: all_products.map((p) => {return {
                serviceId: p.service_id, 
                productId: p.product_id,
                name: p.name,
                description: p.description, 
                carType: p.car_type,
                carMake: p.car_make,
                carYear: p.car_year,
                carPart: p.car_part, 
                stockId: p.stock_id,
                quantity: p.quantity,
                price: p.price,
                supplier: p.supplier, 
                available: p.available,
                unitPrice: p.unit_price,
                sellingPrice: p.selling_price,
            }}),
            payments: all_payments.map((p) => OrderPayment.fromDB(p)),
            mechanics: all_mechanics.map((m) => {
                return {
                    id: m.mechanic_id,
                    firstName: m.first_name,
                    lastName: m.last_name,
                    mobile: m.mobile,
                }
            }),
            customer: User.fromDB({ ...customer }),
            discount,
            subTotal: sub_total,
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
        discount,
        subTotal,
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
        this.orderMechanics = mechanics;
        this.customer = customer;
        this.discount = discount;
        this.subTotal = subTotal;
        this.orderServices = [];
        this.laborTotal = 0;
        this.partsTotal = 0;
        this.paymentsTotal = 0;
        this.cashTotal = 0;
        this.onlineTotal = 0;
        this.accountsReceivableTotal = 0;
        this.chequeTotal = 0;


        // console.dir({allProducts, allServices}, {depth: null});
        // let newTotal = 0;
        for (const service of allServices) {
            // console.log(service);
            const formattedService = {
                id: service.serviceId,
                price: service.price,
                title: service.title,
                description: service.description, 
                products: [],
                completeProducts: [],
            }

            this.laborTotal += parseFloat(service.price);
            // newTotal += parseFloat(service.price);

            for (const product of allProducts) {
                if (product.serviceId == service.serviceId) {
                    formattedService.products.push({
                        productId: product.productId,
                        name: product.name,
                        description: product.description,
                        carType: product.carType,
                        carMake: product.carMake,
                        carYear: product.carYear,
                        carPart: product.carPart,
                        stockId: product.stockId, 
                        price: product.price,
                        quantity: product.quantity,
                        supplier: product.supplier, 
                        available: product.available,
                        unitPrice: product.unitPrice,
                        sellingPrice: product.sellingPrice, 
                    });
                    this.partsTotal += (parseInt(product.quantity) * parseFloat(product.price));
                }
            }
            this.orderServices.push(formattedService);
        }
        /// rebuild products by combinings them
        this.orderServices.forEach((service, serviceIndex) => {
            const addedProducts = [];
            /// add products first
            service.products.forEach((product, productIndex) => {
                if (addedProducts.filter(
                        (v, i, arr) => v.id === product.productId).length == 0) {
                    addedProducts.push({
                        id: product.productId,
                        name: product.name,
                        description: product.description,
                        carType: product.carType,
                        carMake: product.carMake,
                        carYear: product.carYear,
                        carPart: product.carPart,
                        addedStocks: service.products.map((p, i) => {
                            if (p.productId === product.productId) {
                                return {
                                    id: p.stockId,
                                    price: p.price,
                                    quantity: p.quantity,
                                    supplier: p.supplier, 
                                    available: p.available,
                                    unitPrice: p.unitPrice,
                                    sellingPrice: p.sellingPrice,
                                }
                            }
                        }).filter((element) => {
                            return element !== undefined;
                        }),
                    })
                }
            });


            this.orderServices[serviceIndex].addedProducts = addedProducts;
            this.orderServices[serviceIndex].products = [];

        });
        
        for (const payment of payments) {
            const pAmount = parseFloat(payment.amount);
            this.paymentsTotal += pAmount;
            switch(payment.type) {
                case 'Online':
                    this.onlineTotal += pAmount;
                    break;
                case 'AccountsReceivable':
                    this.accountsReceivableTotal += pAmount;
                    break;
                case 'Cheque':
                    this.chequeTotal += pAmount;
                    break;
                case 'Cash':
                default:
                    this.cashTotal += pAmount;
                    break;
            }
        }

    }
    
}   

module.exports = OrderEdit