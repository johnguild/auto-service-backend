const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const serviceMigration0 = require('../../db_migrations/1641136498591_create_services_table');
const productMigration0 = require('../../db_migrations/1641297582352_create_products_table');
const stockMigration0 = require('../../db_migrations/1641300048254_create_stocks_table');
const orderMigration0 = require('../../db_migrations/1642765556944_create_orders_table');
const orderServiceMigration0 = require('../../db_migrations/1642766434532_create_order_services_table');
const orderProductMigration0 = require('../../db_migrations/1642766700669_create_order_products_table');
const orderPaymentMigration0 = require('../../db_migrations/1642766906031_create_order_payments_table');
const mechanicMigration0 = require('../../db_migrations/1644727593949_create_mechanics_table');
const cashMigration0 = require('../../db_migrations/1646914540177_create_cashes_table');
const usageMigration0 = require('../../db_migrations/1646915737379_create_usages_table');
const orderMechanicMigration0 = require('../../db_migrations/1647022126173_create_order_mechanics_table');
const productMigration1 = require('../../db_migrations/1647514335737_add_car_details_on_products_table');
const userMigration1 = require('../../db_migrations/1647518448506_add_company_details_on_users_table');
const toolMigration0 = require('../../db_migrations/1648809625370_create_tools_tables');
const lendMigration0 = require('../../db_migrations/1650029430483_create_lends_table');
const orderMigration1 = require('../../db_migrations/1650623506166_update_orders_add_discount');
const archiveMigration0 = require('../../db_migrations/1657458706580_create_product_archives_table');


const up = async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    await userMigration0.up();
    await serviceMigration0.up();
    await productMigration0.up();
    await stockMigration0.up();
    await orderMigration0.up();
    await orderServiceMigration0.up();
    await orderProductMigration0.up();
    await orderPaymentMigration0.up();
    await mechanicMigration0.up();
    await cashMigration0.up();
    await usageMigration0.up();
    await orderMechanicMigration0.up();
    await productMigration1.up();
    await userMigration1.up();
    await toolMigration0.up();
    await lendMigration0.up();
    await orderMigration1.up();
    await archiveMigration0.up();
}

const down = async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    await userMigration0.down();
    await serviceMigration0.down();
    await productMigration0.down();
    await stockMigration0.down();
    await orderMigration0.down();
    await orderServiceMigration0.down();
    await orderProductMigration0.down();
    await orderPaymentMigration0.down();
    await mechanicMigration0.down();
    await cashMigration0.down();
    await usageMigration0.down();
    await orderMechanicMigration0.down();
    // await productMigration1.down();
    // await userMigration1.down();
    await toolMigration0.down();
    await lendMigration0.down();
    // await orderMigration1.down();
    await archiveMigration0.down();
}


module.exports = {
    up,
    down,
}