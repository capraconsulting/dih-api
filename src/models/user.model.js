/**
 * User model
 * @module models/user
 */
import {
    randomBytes
} from 'crypto';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import Promise from 'bluebird';
import auditLogger from '../components/auditLogger';
import {
    USER_ROLES,
    GENDERS
} from '../components/constants';
import {
    CustomValidationError
} from '../components/errors';
import * as mail from '../components/mail';
import {
    createJwt
} from '../components/auth';

Promise.promisifyAll(bcrypt);

/**
 * User model - create and export the database model for the user
 * including all assosiations and classmethods assiciated with this model.
 * @memberof  module:models/user
 * @param  {Object} sequelize description
 * @param  {Object} DataTypes description
 */
export default function (sequelize, DataTypes) {
    const User = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            set(value) {
                this.setDataValue('email', value.toLowerCase());
            },
            validate: {
                isEmail: true
            }
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        gender: {
            type: DataTypes.ENUM,
            values: _.values(GENDERS),
            allowNull: true
        },
        nationality: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        addressLine1: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        addressLine2: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        birth: {
            type: DataTypes.DATE
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                is: /^\+(?:[0-9] ?){6,14}[0-9]$/i
            }
        },
        medicalDegree: {
            type: DataTypes.STRING,
            allowNull: true
        },
        medicalDegreeLicenseNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        emergencyContactInfo: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        languages: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        notes: DataTypes.STRING,
        volunteerInfo: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        readTerms: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        readPrivacyTerms: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        hash: DataTypes.STRING,
        role: {
            type: DataTypes.ENUM,
            values: _.values(USER_ROLES),
            defaultValue: USER_ROLES.USER
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        getterMethods: {
            fullName() {
                return `${this.firstname} ${this.lastname}`;
            }
        },
        classMethods: {
            associate(models) {
                User.hasMany(models.Trip);
                User.belongsToMany(models.Destination, {
                    through: models.DestinationCoordinator
                }, {
                    foreignKey: 'userId'
                });
            },
            invite(body) {
                return User.create(body)
                    .then(user => user.sendInvite());
            }
        },
        hooks: {
            ...auditLogger,
            beforeUpdate: [
                user => {
                    if (user.changed('isActive') && !user.isActive) {
                        return user.sendDeactivationInfo() // Inform user
                            .then(() => {
                                // Set e-mail to something random so user can same email later
                                const randomStringBeforeAt = randomBytes(16).toString('hex');
                                const randomStringAfterAt = randomBytes(16).toString('hex');
                                user.email = `${randomStringBeforeAt}@${randomStringAfterAt}.com`; // eslint-disable-line
                                return user;
                            });
                    }
                    return Promise.resolve();
                }
            ]
        },
        instanceMethods: {
            authenticate(password) {
                return bcrypt.compareAsync(password, this.hash);
            },
            toJSON() {
                const user = this.get({
                    plain: true
                });
                delete user.hash;
                return user;
            },
            createJwt(additionalPayload) {
                return createJwt({ ...this.toJSON(),
                    ...additionalPayload
                });
            },
            sendDeactivationInfo() {
                return mail.sendDeactivationInfo(this);
            },
            sendInvite() {
                const token = this.createJwt({
                    setPassword: true
                });
                return mail.sendInvite(this, token);
            },
            sendResetPasswordEmail() {
                const token = this.createJwt({
                    setPassword: true
                });
                return mail.sendResetPasswordEmail(this, token);
            },
            updatePassword(password) {
                if (!password || password.length < 8) {
                    throw new CustomValidationError('not a valid password');
                }
                return bcrypt.genSaltAsync()
                    .then(salt => bcrypt.hashAsync(password, salt))
                    .then(hash => {
                        this.hash = hash;
                        return this.save();
                    });
            },
            sendDestinationAction(tripId, tripStatus, destination, mailContent) {
                const token = this.createJwt();
                return mail.sendDestinationAction(tripId, tripStatus, this, mailContent, token);
            },
            sendDestinationInfo(tripStatus, destination, mailContent) {
                return mail.sendDestinationInfo(tripStatus, this, mailContent);
            }
        }
    });
    return User;
}
