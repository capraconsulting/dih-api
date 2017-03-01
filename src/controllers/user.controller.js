/**
 * User controller
 * @module controllers/user
 * @exports controllers/user/list
 */
import Sequelize from 'sequelize';
import db from '../models';
import { DatabaseError, ResourceNotFoundError, ValidationError } from '../components/errors';

/**
 * list - List all users in the database
 *
 * @function list
 * @memberof  module:controllers/user
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function list(req, res, next) {
    db.User.findAll({ where: { isActive: true } })
    .then(res.json.bind(res))
    .catch(next);
}

/**
 * retrieve - Retrieves a single user by ID.
 *
 * @function retrieve
 * @memberof module:controllers/user
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function retrieve(req, res, next) {
    db.User.findOne({
        where: {
            id: req.params.id,
            isActive: true
        }
    })
    .then(user => {
        if (!user) throw new ResourceNotFoundError('user');
        res.json(user);
    })
    .catch(next);
}

/**
 * update - Updates a single user given ID and that the user exists.
 *
 * @function update
 * @memberof module:controllers/user
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function update(req, res, next) {
    db.User.findOne({
        where: {
            id: req.params.id
        }
    })
    .then(user => {
        if (!user) throw new ResourceNotFoundError('user');
        return user.update(req.body);
    })
    .then(() => res.sendStatus(204))
    .catch(Sequelize.ValidationError, err => {
        throw new ValidationError(err);
    })
    .catch(Sequelize.DatabaseError, err => {
        throw new DatabaseError(err);
    })
    .catch(next);
}

/**
 * create - creates a user.
 *
 * @function create
 * @memberof  module:controllers/user
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function create(req, res, next) {
    db.User.invite({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email
    })
    .then(user => res.status(201).json(user))
    .catch(Sequelize.ValidationError, err => {
        throw new ValidationError(err);
    })
    .catch(next);
}
