'use strict';

const service = require('./service');

module.exports = {
    getData
};

async function getData(req, res) {
    try {
        let data = await service.swapi(req.params, req.query);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).send(err.message);
    }
}
