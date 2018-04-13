'use strict';

const http = require('http');
const app = require('./lib/express');

module.exports = createServer(app);

function createServer(app) {
    const server = http.createServer(app).listen(8080);
    server.on('listening', _listening);
    server.on('error', _error);
    return app;
}

function _listening() {
    let msg = `Express server listening on 127.0.0.1:8080/api`;
    return console.log(msg);
}

function _error(err) {
    if (err.syscall !== 'listen') {
        throw err;
    }
    if (err.code === 'EACCES') {
        console.error(`Port 8080 requires elevated privileges`);
        return process.exit(1);
    }
    if (err.code === 'EADDRINUSE') {
        console.error(`Port 8080 is already in use`);
        return process.exit(1);
    }
    throw err;
}
