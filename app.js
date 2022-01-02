const express = require('express');
const cors = require('cors');
// const StatusRouter = require('./status/status.router.v1');

const app = express();

// app.use(StatusRouter);

app.use(cors());
app.use(express.json());

var http = require('http').Server(app);

module.exports = {
    app,
    http
}