const { app, http } = require('./app');

// Use env variables for app
const port = process.env.PORT;
const hostname = process.env.SERVER_IP;

if (hostname !== undefined) {
    http.listen(port, hostname, () => {
        console.log(`Server up and running on server ${hostname} port ${port}.`);
    });
} else {
    http.listen(port, () => {
        console.log(`Server up and running on port ${port}.`);
    });
}

