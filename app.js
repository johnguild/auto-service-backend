const express = require('express');
const cors = require('cors');
// const StatusRouter = require('./status/status.router.v1');
const UserRouter = require('./user/user.router.v1');
const PersonnelRouter = require('./user/personnel.router.v1');
const CustomerRouter = require('./user/customer.router.v1');

const app = express();

// app.use(StatusRouter);

app.use(cors());
app.use(express.json());
app.use(UserRouter);
app.use(PersonnelRouter);
app.use(CustomerRouter);

var http = require('http').Server(app);

module.exports = {
    app,
    http
}