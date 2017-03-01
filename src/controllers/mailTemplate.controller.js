/**
 * mailTemplate controller
 * @module controllers/mailTemplate
 */
import Sequelize from 'sequelize';
import db from '../models';
import { ResourceNotFoundError, ValidationError } from '../components/errors';

/**
 * list - List all mailTemplates in the database
 *
 * @function list
 * @memberof  module:controllers/mailTemplate
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function list(req, res, next) {
    db.MailTemplate.findAll({
        where: req.query
    })
    .then(res.json.bind(res))
    .catch(next);
}

/**
 * retrieve - Retrieves a single mailTemplate by ID.
 *
 * @function retrieve
 * @memberof module:controllers/trip
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function retrieve(req, res, next) {
    db.MailTemplate.findOne({
        where: {
            id: req.params.id
        }
    })
    .then(mailTemplate => {
        if (!mailTemplate) throw new ResourceNotFoundError('mailTemplate');
        res.json(mailTemplate);
    })
    .catch(next);
}


/**
 * retrieve - Retrieves the auditlog of an mailTemplate by ID.
 *
 * @function retrieve
 * @memberof module:controllers/trip
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function retrieveAuditLog(req, res, next) {
    db.AuditLog.findAll({
        where: {
            entity: db.MailTemplate.tableName,
            entityId: req.params.id
        }
    })
    .then(res.json.bind(res))
    .catch(next);
}


/**
 * create - creates a mailTemplate.
 *
 * @function create
 * @memberof  module:controllers/mailTemplate
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function create(req, res, next) {
    db.MailTemplate.create(req.body)
    .then(savedObj => res.status(201).json(savedObj))
    .catch(Sequelize.ValidationError, err => {
        throw new ValidationError(err);
    })
    .catch(next);
}

/**
 * destroy - Deletes a mailTemplate given id and that the mailTemplate exists
 *
 * @function destroy
 * @memberof  module:controllers/mailTemplate
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function destroy(req, res, next) {
    db.MailTemplate.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(count => {
        if (count === 0) {
            throw new ResourceNotFoundError('mailTemplate');
        }
    })
    .then(() => res.sendStatus(204))
    .catch(next);
}

/**
 * update - Updates a mailTemplate given id and that the mailTemplate exists
 *
 * @function update
 * @memberof  module:controllers/mailTemplate
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 */
export function update(req, res, next) {
    db.MailTemplate.findOne({
        where: {
            id: req.params.id
        }
    })
    .then(item => {
        if (!item) {
            throw new ResourceNotFoundError('mailTemplate');
        }
        return item.update(req.body);
    })
    .then(() => res.sendStatus(204))
    .catch(Sequelize.ValidationError, err => {
        throw new ValidationError(err);
    })
    .catch(next);
}
