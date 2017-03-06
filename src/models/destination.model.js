/* eslint-disable no-param-reassign */
import Promise from 'bluebird';
import auditLogger from '../components/auditLogger';
import { TRIP_STATUSES, STANDARD_MAIL_TEMPLATES } from '../components/constants';
import { createMailTemplatesForDestination } from '../db-helpers';
import db from './';

export default function (sequelize, DataTypes) {
    const Destination = sequelize.define('destination', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        minimumTripDurationInDays: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date()
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        getterMethods: {
            isActive() {
                // Check for endDate as it can be null
                // Then see if the current time is within the range
                return (this.endDate ? this.endDate >= new Date() : true)
                && this.startDate <= new Date();
            }
        },
        hooks: {
            ...auditLogger,
            beforeCreate: createMailTemplatesForDestination,
            beforeSave: createMailTemplatesForDestination
        },
        classMethods: {
            associate(models) {
                Destination.hasMany(models.Trip);
                Destination.belongsTo(models.MailTemplate, {
                    foreignKey: {
                        name: 'acceptedStatusMailTemplateId',
                        allowNull: true
                    }
                });
                Destination.belongsTo(models.MailTemplate, {
                    foreignKey: {
                        name: 'rejectedStatusMailTemplateId',
                        allowNull: true
                    }
                });
                Destination.belongsTo(models.MailTemplate, {
                    foreignKey: {
                        name: 'pendingStatusMailTemplateId',
                        allowNull: true
                    }
                });
                Destination.belongsToMany(models.User,
                    { through: models.DestinationCoordinator },
                    { foreignKey: 'destinationId' });
            },
            findOneAndIncludeActiveTripCount(destId) {
                // Sequelize getterMethods does not support Promises,
                // so these custom find methods are used when one wants to
                // include certain calculated fields.
                return Destination.findOne({
                    where: {
                        id: destId
                    },
                    include: [{
                        model: db.User
                    }]
                })
                .then(destination => {
                    if (!destination) return Promise.reject(null);
                    return [destination.toJSON(), destination.countTrips({
                        where: {
                            status: TRIP_STATUSES.PRESENT
                        }
                    })];
                })
                .spread((destination, countOfActiveVolunteers) =>
                    ({ ...destination, countOfActiveVolunteers })
                );
            },
            findAllAndIncludeActiveTripCount(query) {
                return Destination.findAll({
                    where: query,
                    include: [{
                        model: db.User
                    }]
                })
                .then(destinations =>
                    Promise.map(destinations, destination =>
                        destination.countTrips({
                            where: {
                                status: TRIP_STATUSES.PRESENT
                            }
                        })
                        .then(countOfActiveVolunteers =>
                            ({ ...destination.toJSON(), countOfActiveVolunteers })
                        )
                    )
                );
            },
            createWithMailTemplates(body) {
                return db.Destination.create(body)
                    .then(destination =>
                        Promise.all([
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
                        .spread((pending, accepted, rejected) => {
                            destination.pendingStatusMailTemplateId = pending.id;
                            destination.acceptedStatusMailTemplateId = accepted.id;
                            destination.rejectedStatusMailTemplateId = rejected.id;
                            return destination.save();
                        })
                    );
            }
        },
        instanceMethods: {
            addCoordinators(users) {
                return Promise.map(users, user => this.addUsers([user.userId],
                    { startDate: user.startDate, endDate: user.endDate })
                );
            }
        }
    });
    return Destination;
}
