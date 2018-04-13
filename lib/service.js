'use strict';

const domain = 'https://swapi.co';
const request = require('request-promise').defaults({ json: true });

module.exports = {
    swapi
};

async function swapi(params, query) {
    let data;
    let residents;

    if (params.resource) data = await getData(params);

    if (params.resource === 'planets')
        residents = await getData({ resource: 'people' });

    return pipe(data).thru(
        sorter(query.sortby),
        limiter(query.offset, query.limit),
        formatter(residents)
    );
}

async function getData(params) {
    let _data = [];
    let response = { next: buildURI(params) };

    if (params.id) return [await request.get(response.next)];

    do {
        response = await request.get(response.next);
        _data = _data.concat(response.results);
    } while (response.next);

    return _data;
}

function buildURI(params) {
    let uri = `${domain}/api`;
    if (params.resource) uri += `/${params.resource}`;
    if (params.id) uri += `/${params.id}`;
    return uri;
}

function sorter(sortby) {
    return _data => {
        if (!isArray(_data) || !sortby) return _data;

        let _key = sortby.replace(/^-/, '');
        let _slice = _data.slice();
        if (sortby[0] === '-')
            return _slice.sort((a, b) => getVal(b, _key) - getVal(a, _key));
        return _slice.sort((a, b) => getVal(a, _key) - getVal(b, _key));
    };
}

function limiter(offset, limit) {
    return _data => {
        offset = toNumber(offset, 0);
        limit = toNumber(limit);
        return limit || offset
            ? _data.slice(offset, offset + limit)
            : _data.slice();
    };
}

function formatter(residents) {
    return _data => {
        if (isEmpty(residents)) return _data;
        residents = arrayToObject(residents, 'url');
        return _data.map(p =>
            Object.assign(p, {
                residents: mapper(p.residents, residents, 'name')
            })
        );
    };
}

function mapper(keys, source, prop) {
    if (!isArray(keys)) return keys;
    return keys.map(key => source[key][prop] || '');
}

function getVal(o, prop) {
    switch (prop) {
        case 'height':
        case 'mass':
        case 'population':
        case 'diameter':
            return toNumber(o[prop], 0);
        default:
            return o[prop];
    }
}

function toNumber(s, nz) {
    let i = Number(s);
    return i === i ? i : nz;
}

function arrayToObject(arr, key) {
    if (!isArray(arr) || !key) return {};
    return arr.reduce((acc, o) => Object.assign(acc, { [o[key]]: o }), {});
}

function isEmpty(o) {
    if (isObject(o)) return !Object.keys(o).length;
    if (isArray(o)) return !o.length;
    return !o;
}

function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
}

function isArray(o) {
    return Array.isArray(o);
}

// Process a target object with a pipe of decorator functions
function pipe(...obj) {
    return {
        thru: (...fns) => fns.reduce((acc, fn) => () => fn(acc(...obj)))()
    };
}
