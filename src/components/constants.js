/**
 * All constants used trouought the application.
 * @module components/constants
 */

/**
 * The possible roles a user can have.
 * @type {object}
 * @property {string} USER - Grants this user the basic user permissions.
 * @property {string} MODERATOR - Grants this user the user permissions and moderator permissions.
 * @property {string} ADMIN - Grants this user the admin permissions.
 */
exports.USER_ROLES = {
    USER: 'USER',
    MODERATOR: 'MODERATOR',
    ADMIN: 'ADMIN'
};

/**
 * The possible message mediums used for communication.
 * @type {object}
 * @property {string} SMS - The user will arrive by plane, should trigger specific fields.
 * @property {string} EMAIL - The uset will arrive by other method than listed, should trigger
 * a free text field.
 */
exports.MESSAGE_MEDIUMS = {
    SMS: 'SMS',
    EMAIL: 'EMAIL'
};


/**
 * The possible methods of travel for a trip.
 * @type {object}
 * @property {string} PLANE - The user will arrive by plane, should trigger specific fields.
 * @property {string} OTHER - The uset will arrive by other method than listed, should trigger
 * a free text field.
 */
exports.TRAVEL_METHODS = {
    PLANE: 'PLANE',
    OTHER: 'OTHER'
};

/**
 * The possible roles a user can have.
 * @type {object}
 * @property {string} PENDING - The trip is requested by a user but not handled by an admin
 * @property {string} ACCEPTED - The trip is accepted by an admin
 * @property {string} REJECTED - The trip is rejected by an admin
 * @property {string} ACTIVE - The trip is currently in progress by a user
 * @property {string} CLOSED - The trip is closed, hence the user has completed this trip
 * @property {string} PRESENT - Volunteer is present at destination
 * @property {string} LEFT - Volunteer has left the destination
 * @property {string} NOSHOW - Volunteer did not show up at location
 */
exports.TRIP_STATUSES = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    ACTIVE: 'ACTIVE',
    CLOSED: 'CLOSED',
    PRESENT: 'PRESENT',
    LEFT: 'LEFT',
    NOSHOW: 'NOSHOW'
};

/**
 * Gnders that a user can have
 * @type {object}
 * @property {string} MALE - Male
 * @property {string} FEMALE - Female
 */
exports.GENDERS = {
    MALE: 'MALE',
    FEMALE: 'FEMALE'
};

/**
 * Gnders that a user can have
 * @type {object}
 * @property {string} MALE - Male
 * @property {string} FEMALE - Female
 */
exports.VALID_ACTIONS = {
    ACTION_CREATE: 'create',
    ACTION_UPDATE: 'update',
    ACTION_DELETE: 'delete'
};

/**
 * Gnders that a user can have
 * @type {object}
 * @property {string} MALE - Male
 * @property {string} FEMALE - Female
 */
exports.VALID_SOURCES = {
    USERS: 'users',
    DESTINATIONS: 'destinations',
    TRIPS: 'trips',
    MAIL_TEMPLATE: 'mailTemplates'
};


/**
 * The standard email templates used for new destinatons
 * @type {object}
 * @property {string} TRIP_STATUS_PENDING - Template used when trip status is set to pending
 * @property {string} TRIP_STATUS_ACCEPTED - Template used when trip status is set to accepted
 * @property {string} TRIP_STATUS_REJECTED - Template used when trip status is set to rejected
 */
exports.STANDARD_MAIL_TEMPLATES = {
    TRIP_STATUS_PENDING: `Hi, <br>
    <p>We have received your request to volunteer for us. We will get back to you
    within a few days. </p>
    <p>Thank you for wanting to volunteer with us. <br>
     </p>`,
    TRIP_STATUS_ACCEPTED: `Hi, <br>
    <p>We are pleased to announce that your request to volunteer
    with us has been approved. </p>
    In order to travel with us, you have to register travel and accommodation details
    under "My Trips" on your profile.
    <p<
    You will receive an invitation to a travel group for the destination and period
    on Facebook.
    <p>
    We recommend that you check with your doctor to see if you need additional vaccines,
    and make sure you have your travel insurance in order.
    </p>
    <p>
    Thank you. <br>
    </p> `,
    TRIP_STATUS_REJECTED: `Hi,
    <p>Unfortunately, we do not need volunteers in the period you requested.
    If you have the opportunity to travel to another destination or in another period,
    we appreciate if you would request a new travel at our page. </p>`,
    TRIP_STATUS_LEFT: `Hi,
    <p>We can now see that you have left your destination. </p>`
};
