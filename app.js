const express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const UserRouter = require('./user/user.router.v1');
const PersonnelRouter = require('./user/personnel.router.v1');
const AuditorRouter = require('./user/auditor.router.v1');
const ClerkRouter = require('./user/clerk.router.v1');
const CustomerRouter = require('./user/customer.router.v1');
const MechanicRouter = require('./mechanic/mechanic.router.v1');
const ServiceRouter = require('./service/service.router.v1');
const ProductRouter = require('./product/product.router.v1');
const OrderRouter = require('./order/order.router.v1');
const CashRouter = require('./cash/cashes.router.v1');
const UsageRouter = require('./cash/usage.router.v1');
const StockRouter = require('./stock/stock.router.v1');
const ToolRouter = require('./tool/tool.router.v1');
const LendRouter = require('./lend/lend.router.v1');

const app = express();

app.use(cors({credentials: true, origin: true, exposedHeaders: '*'}));
// app.use(express.json({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(UserRouter);
app.use(PersonnelRouter);
app.use(AuditorRouter);
app.use(ClerkRouter);
app.use(CustomerRouter);
app.use(MechanicRouter);
app.use(ServiceRouter);
app.use(ProductRouter);
app.use(OrderRouter);
app.use(CashRouter);
app.use(UsageRouter);
app.use(StockRouter);
app.use(ToolRouter);
app.use(LendRouter);

var http = require('http').Server(app);

module.exports = {
    app,
    http
}