/**
 * Account controller - All functions for the user currently using the api
 * @module controllers/account
 */
import Sequelize from 'sequelize';
import db from '../models';
import * as errors from '../components/errors';

/**
 * trips - Fetch trips for the current user
 *
 * @function trips
 * @memberof  module:controllers/account
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function trips(req, res, next) {
    if (!db.Trip.validateQuery(req.query)) {
        throw new errors.errors.UriValidationError();
    }

    db.Trip.findAll({
        where: {
            userId: req.user.id
        },
        include: [{
            model: db.User,
            attributes: {
                exclude: ['hash']
            }
        }, {
            model: db.Destination
        }]
    })
    .then(res.json.bind(res))
    .catch(next);
}

/**
 * retrieve - Retrieves the current user given by the payload in the jwt
 *
 * @function retrieve
 * @memberof  module:controllers/account
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function retrieve(req, res, next) {
    db.User.findOne({
        where: {
            id: req.user.id
        }
    })
    .then(user => {
        if (!user) throw new errors.ResourceNotFoundError('user');
        res.json(user);
    })
    .catch(next);
}

/**
 * update - Updates the current user
 *
 * @function update
 * @memberof  module:controllers/account
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function update(req, res, next) {
    db.User.findOne({
        where: {
            id: req.user.id
        }
    })
    .then(user => {
        if (!user) throw new errors.ResourceNotFoundError('user');
        return user.update(req.body);
    })
    .then(() => res.sendStatus(204))
    .catch(Sequelize.ValidationError, err => {
        throw new errors.ValidationError(err);
    })
    .catch(Sequelize.DatabaseError, err => {
        throw new errors.DatabaseError(err);
    })
    .catch(next);
}
