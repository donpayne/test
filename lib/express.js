'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const compress = require('compression');
const helmet = require('helmet');
const controller = require('./controller');

let app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compress());
app.get('/api', (req, res) => res.send(`Welcome to Growmies SWAPI`));
app.get('/api/:resource', controller.getData);
app.get('/api/:resource/:id', controller.getData);

module.exports = app;
