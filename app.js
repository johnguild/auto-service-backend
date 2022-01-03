const express = require('express');
const cors = require('cors');
const UserRouter = require('./user/user.router.v1');
const PersonnelRouter = require('./user/personnel.router.v1');
const CustomerRouter = require('./user/customer.router.v1');
const ServiceRouter = require('./service/service.router.v1');

const app = express();

app.use(cors());
app.use(express.json());
app.use(UserRouter);
app.use(PersonnelRouter);
app.use(CustomerRouter);
app.use(ServiceRouter);

var http = require('http').Server(app);

module.exports = {
    app,
    http
}