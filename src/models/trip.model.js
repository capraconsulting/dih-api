import _ from 'lodash';
import Promise from 'bluebird';
import { validateQuery } from '../components/queryValidator';
import auditLogger from '../components/auditLogger';
import { TRAVEL_METHODS, TRIP_STATUSES, USER_ROLES, STANDARD_MAIL_TEMPLATES }
from '../components/constants';
import db from './';

const ALLOWED_QUERY_PARAMS = ['destinationId', 'userId', 'status'];

export default function (sequelize, DataTypes) {
    const Trip = sequelize.define('trip', {
        status: {
            type: DataTypes.ENUM,
            values: _.values(TRIP_STATUSES),
            defaultValue: TRIP_STATUSES.PENDING
        },
        startDate: {
            type: DataTypes.DATE
        },
        endDate: {
            type: DataTypes.DATE
        },
        hotel: {
            type: DataTypes.STRING
        },
        notes: {
            type: DataTypes.TEXT
        },
        travelMethod: {
            type: DataTypes.ENUM,
            values: _.values(TRAVEL_METHODS)
        },
        departureAirport: DataTypes.STRING,
        flightNumber: DataTypes.STRING,
        arrivalDate: DataTypes.DATE,
        departureDate: DataTypes.DATE,
        otherTravelInformation: DataTypes.TEXT,
        statusComment: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        dateArrived: {
            type: DataTypes.DATE,
            allowNull: true
        },
        dateLeft: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        classMethods: {
            associate(models) {
                Trip.belongsTo(models.User, {
                    foreignKey: {
                        name: 'userId',
                        allowNull: false
                    }
                });
                Trip.belongsTo(models.Destination, {
                    foreignKey: {
                        name: 'destinationId',
                        allowNull: true
                    }
                });
            },
            validateQuery(query) {
                return validateQuery(query, ALLOWED_QUERY_PARAMS);
            },
            isValidReqBody(body) {
                return body.destinationId;
            },
            getQueryObject(req) {
                return new Promise(resolve => {
                    if (req.user.role === USER_ROLES.USER) {
                        return resolve({
                            userId: req.user.id
                        });
                    } else if (req.user.role === USER_ROLES.MODERATOR) {
                        return db.User.findOne({
                            where: req.user.id
                        })
                        .then(coordinator => coordinator.getDestinations())
                        .then(objects => objects.map(object => object.id))
                        .then(destinationIds => {
                            resolve({
                                $or: [{
                                    destinationId: {
                                        in: destinationIds
                                    } },
                                { userId: req.user.id }
                                ]
                            });
                        });
                    } else if (req.user.role === USER_ROLES.ADMIN) return resolve(req.query);
                });
            }
        },
        hooks: {
            ...auditLogger,
            beforeUpdate: [
                trip => {
                    if (trip.changed('status')) {
                        if (trip.status === TRIP_STATUSES.ACCEPTED) {
                            // Don't return. If it has travelInfo the status should be
                            // set to active
                            trip.userActionToUser(trip.id, trip.status);
                        }
                        if (trip.status === TRIP_STATUSES.REJECTED) {
                            return trip.userInfoToUser(trip.status);
                        }
                    }
                    if (trip.status === TRIP_STATUSES.ACCEPTED && trip.hasTravelInfo()) {
                        // Reassignment because we want to change the sequelize instance
                        trip.status = TRIP_STATUSES.ACTIVE; // eslint-disable-line
                    }
                    return Promise.resolve();
                }
            ],
            afterCreate: trip => trip.userInfoToUser(trip.status)
        },
        instanceMethods: {
            userActionToUser(tripId, tripStatus) {
                return Promise.all([
                    db.Destination.findById(this.destinationId),
                    db.User.findById(this.userId)
                ])
                .spread((destination, user) =>
                    db.MailTemplate
                    .findById(destination[`${tripStatus.toLowerCase()}StatusMailTemplateId`])
                    .then(template => {
                        if (template) {
                            user.sendDestinationAction(tripId, tripStatus,
                                destination, template.html);
                        }
                    })
                );
            },
            userInfoToUser(tripStatus) {
                return Promise.all([
                    db.Destination.findById(this.destinationId),
                    db.User.findById(this.userId)
                ])
                .spread((destination, user) => {
                    if (destination) {
                        db.MailTemplate
                        .findById(destination[`${tripStatus.toLowerCase()}StatusMailTemplateId`])
                        .then(template => {
                            if (template) {
                                user.sendDestinationInfo(tripStatus,
                                destination, template.html);
                            }
                        });
                    } else if (!destination && tripStatus === TRIP_STATUSES.PENDING) {
                        user.sendDestinationInfo(TRIP_STATUSES.PENDING,
                        destination, STANDARD_MAIL_TEMPLATES.TRIP_STATUS_PENDING);
                    }
                }
                );
            },
            hasTravelInfo() {
                if (this.travelMethod === TRAVEL_METHODS.PLANE) {
                    return this.flightNumber && this.departureAirport;
                } else if (this.travelMethod === TRAVEL_METHODS.OTHER) {
                    return this.otherTravelInformation;
                }
                return false;
            }
        }
    });
    return Trip;
}
