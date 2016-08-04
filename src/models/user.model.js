/**
* User model
* @module models/user
*/
import _ from 'lodash';
import bcrypt from 'bcrypt';
import Promise from 'bluebird';
import { USER_ROLES } from '../components/constants';
import { CustomValidationError } from '../components/errors';
import * as mail from '../components/mail';
import { createJwt } from '../components/auth';

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
        birth: {
            type: DataTypes.DATE
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
        hash: DataTypes.STRING,
        role: {
            type: DataTypes.ENUM,
            values: _.values(USER_ROLES),
            defaultValue: USER_ROLES.USER
        }
    }, {
        classMethods: {
            associate(models) {
                User.hasMany(models.Trip);
                User.belongsToMany(models.Destination,
                    { through: models.DestinationCoordinator },
                    { foreignKey: 'userId' },
                );
            },
            invite(body) {
                return User.create(body)
                .then(user => user.sendInvite());
            }
        },
        instanceMethods: {
            authenticate(password) {
                return bcrypt.compareAsync(password, this.hash);
            },
            toJSON() {
                const user = this.get({ plain: true });
                delete user.hash;
                return user;
            },
            createJwt(additionalPayload) {
                return createJwt({ ...this.toJSON(), ...additionalPayload });
            },
            sendInvite() {
                const token = this.createJwt({ setPassword: true });
                return mail.sendInvite(this, token);
            },
            sendResetPasswordEmail() {
                const token = this.createJwt({ setPassword: true });
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
            sendDestinationAction(destination, mailContent) {
                const token = this.createJwt();
                return mail.sendDestinationAction(this, mailContent, token);
            },
            sendDestinationInfo(destination, mailContent) {
                return mail.sendDestinationInfo(this, mailContent);
            }
        }
    });
    return User;
}
