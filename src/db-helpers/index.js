/**
 * All functions and setup regarding authentification and authorization.
 * @module db-helpers/index
 */
import Promise from 'bluebird';
import migrate from './migrate';
import db from '../models';
import { STANDARD_MAIL_TEMPLATES } from '../components/constants';


/**
 * syncDB - Simple and dirty DB migration to be used in test/dev
 *
 * @function syncDB
 * @memberof  module:db-helpers/index
 * @param  {Object} options - force=boolean, if true, drops all the tables in sync operation
 * @return {Promise} - When the database is done syncing and ready to be used
 */
export function syncDB({ force } = {}) {
    return db
        .sequelize
        .sync({ force });
}


/**
 * migrateDB - Migrates the database with the migration data in /migrations
 *
 * @function migrateDB
 * @memberof  module:db-helpers/index
 * @return {Promise} - When the database is done migrating and ready to be used
 */
export function migrateDB() {
    return migrate(db.sequelize)
        .up();
}

/**
 * createDefaultAdmin - Creates a default user with role ADMIN
 *
 * @function createDefaultAdmin
 * @memberof  module:db-helpers/createDefaultAdmin
 * @return {SequlizeInstance} user The default user with role ADMIN
 */
export function createDefaultAdmin(password) {
    return db.User.create({
        firstname: 'Admin',
        lastname: 'Capra',
        role: 'ADMIN',
        email: 'admin@dih.capra.me'
    })
    .then(user => {
        user.updatePassword(password);
    })
    .catch(db.sequelize.UniqueConstraintError, () => {}); // In case it's already added
}

/**
 * createMailTemplatesForDestination - Creates default mail templates for a destination
 *
 * @function createMailTemplatesForDestination
 * @memberof  module:db-helpers/createMailTemplatesForDestination
 * @return {Promise}
 */
export function createMailTemplatesForDestination(destination) {
    if (!destination.pendingStatusMailTemplateId && // Ensures working migrations
        !destination.acceptedStatusMailTemplateId && // and tests
        !destination.rejectedStatusMailTemplateId) {
        return Promise.resolve();
    }
    return Promise.all([ // bulkCreate does not return inserted elements
        db.MailTemplate.create({
            html: STANDARD_MAIL_TEMPLATES.TRIP_STATUS_PENDING
        }),
        db.MailTemplate.create({
            html: STANDARD_MAIL_TEMPLATES.TRIP_STATUS_ACCEPTED
        }),
        db.MailTemplate.create({
            html: STANDARD_MAIL_TEMPLATES.TRIP_STATUS_REJECTED
        })
    ])
    .spread((mt1, mt2, mt3) => {
        // Eslind disabled due to reassignment
        // Must reassign as it is the instance to be created
        destination.pendingStatusMailTemplateId = mt1.id; // eslint-disable-line
        destination.acceptedStatusMailTemplateId = mt2.id; // eslint-disable-line
        destination.rejectedStatusMailTemplateId = mt3.id; // eslint-disable-line
    });
}
