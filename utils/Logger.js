const { createLogger, transports, format } = require('winston');


const custom = createLogger({
    transports: process.env.ENV == 'production' 
        ? [
            new transports.File({
                filename:'system.log',
                level: 'info',
                format: format.combine(format.timestamp(), format.json())
            }),
            new transports.File({
                filename:'system-error.log',
                level: 'error',
                format: format.combine(format.timestamp(), format.json())
            }),
        ]
        : [
            new transports.Console({
                level: 'info',
                format: format.combine(format.timestamp(), format.json())
            }),
            new transports.Console({
                level: 'error',
                format: format.combine(format.timestamp(), format.json())
            }),
        ]
})

module.exports = { 
    custom 
}
