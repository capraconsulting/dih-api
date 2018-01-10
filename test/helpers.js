import sequelizeFixtures from 'sequelize-fixtures';
import path from 'path';
import Promise from 'bluebird';
import jwt from 'jsonwebtoken';
import db from '../src/models';
import { syncDB } from '../src/db-helpers';
import config from '../src/config';

Promise.promisifyAll(jwt);

export function loadFixtures(fixtures) {
    const f = fixtures || [
        'users',
        'destinations',
        'trips'
    ];
    const fixturePaths = f.map(file => `${path.resolve(__dirname)}/fixtures/${file}.json`);
    return syncDB({ force: true })
        .then(() => sequelizeFixtures.loadFiles(fixturePaths, db));
}

/**
 * getAllElements - Gives you one of the fixture elements of a given type
 *
 * @param {model} - Model you want to get elements from
 * @return {Array}  - All fixture elements form db
 */
export function getAllElements(model) {
    return db[model].findAll()
        .then(objects => objects.map(object => object.toJSON()));
}

/**
 * createValidJWT - Create a valid JWT for testing purposes
 *
 * @param {Object} payload
 * @return {String} - Valid JWT token
 */
export function createValidJWT(payload) {
    return jwt.sign(payload, config.secret, {
        expiresIn: config.jwtExpiresIn
    });
}

/**
 * validateJwt - Validate a JWT for testing purposes
 *
 * @param {String} token
 * @return {Object} - decoded token
 */
export function validateJwt(token) {
    return jwt.verifyAsync(token, config.secret);
}

/**
 * createInvalidJWT - Create an invalid JWT for testing purposes
 *
 * @param {Object} payload
 * @return {String} - Invalid JWT token
 */
export function createInvalidJWT(payload) {
    return jwt.sign(payload, `${config.secret}noise`, {
        expiresIn: config.jwtExpiresIn
    });
}
