/**
 * All functions and setup regarding generating and sending emails.
 * @module components/mail
 */
import nodemailer from 'nodemailer';
import handlebars from 'express-handlebars';
import Promise from 'bluebird';
import hbs from 'nodemailer-express-handlebars';
import ses from 'nodemailer-ses-transport';
import path from 'path';
import { handleError } from '../errors';
import config from '../../config';
import { TRIP_STATUSES } from '../constants';

let transporter;
const transport = config.nodeEnv === 'development'
    ? config.smtpUrl : ses({ region: config.region });

const options = hbs({
    viewEngine: handlebars.create({}),
    viewPath: path.resolve(__dirname.replace('/dist/', '/src/'))
});

/**
 * updateTransporter - This function allows us to update the transport method used to send email.
 * Such that when running tests we can mock the transport and test all the mail functionality
 * The default transporter is AWS SES
 *
 * @function updateTransport
 * @memberof  module:components/mail
 * @param  {Object} transportMedium the transport ubject we would like to use
 */
export function updateTransport(transportMedium) {
    transporter = Promise.promisifyAll(nodemailer.createTransport(transportMedium));
    transporter.use('compile', options);
}

updateTransport(transport);

/**
 * sendResetPasswordEmail - Sends an reset password email to the specified user,
 *
 * @function sendResetPasswordEmail
 * @memberof  module:components/mail
 * @param  {SequlizeInstance} user The user which is going to recive the email
 * @param  {string} token A JWT used to authorize with the rest api
 * @return {SequlizeInstance} user The user who was sent the email
 */
export function sendResetPasswordEmail(user, token) {
    const mailOptions = {
        to: user.email,
        from: `A Drop in the Ocean <${config.email}>`,
        replyTo: config.email,
        subject: 'Password reset for A Drop in the Ocean',
        template: 'action',
        context: {
            content: 'You have requestet a password reset, follow this link to set a new password',
            action: {
                text: 'Reset password',
                url: `${config.web}/password/confirm?token=${token}`
            }
        }
    };

    return transporter.sendMailAsync(mailOptions)
        .then(() => user)
        .catch(handleError);
}

/**
 * sendInvite - Sends an invite email to the specified user,
 *
 * @function sendInvite
 * @memberof  module:components/mail
 * @param  {SequlizeInstance} user The user which is going to recive the email
 * @param  {string} token A JWT used to authorize with the rest api
 * @return {SequlizeInstance} user The user who was sent the email
 */
export function sendInvite(user, token) {
    const mailOptions = {
        to: user.email,
        from: `A Drop in the Ocean <${config.email}>`,
        replyTo: config.email,
        subject: 'Complete registration - A Drop in the Ocean!',
        template: 'action',
        context: {
            content: `You have created an account with A Drop in the Ocean.
            Click the button below to complete the registration.`,
            action: {
                text: 'Complete registration',
                url: `${config.web}/signup/confirm?token=${token}`
            }
        }
    };

    return transporter.sendMailAsync(mailOptions)
        .then(() => user)
        .catch(handleError);
}

/**
 * sendDestinationAcceptance - Sends an e-mail to a user that's accepted to a destiation
 *
 * @function sendDestinationAcceptance
 * @memberof  module:components/mail
 * @param  {SequlizeInstance} user The user which is going to recive the email
 * @param  {string} mailContent The content of the info e-mail to be sent
 * @param  {string} token A JWT used to authorize with the rest api
 * @return {SequlizeInstance} user The user who was sent the email
 */
export function sendDestinationAction(tripId, tripStatus, user, mailContent, token) {
    const mailOptions = {
        to: user.email,
        from: `A Drop in the Ocean <${config.email}>`,
        replyTo: config.email,
        template: 'action',
        context: {
            content: mailContent
        }
    };
    if (tripStatus === TRIP_STATUSES.ACCEPTED) {
        mailOptions.subject = 'Trip request approved - A Drop in the Ocean';
        mailOptions.context.action = {
            text: 'Complete Trip Registration',
            url: `${config.web}/trips/${tripId}/edit/?token=${token}`
        };
    }
    return transporter.sendMailAsync(mailOptions)
        .then(() => user)
        .catch(handleError);
}

/**
 * sendDestinationInfo - Sends an informational
 * e-mail to a user  with given information as content
 *
 * @function sendDestinationInfo
 * @memberof  module:components/mail
 * @param  {SequlizeInstance} user The user which is going to recive the email
 * @param  {string} mailContent The content of the info e-mail to be sent
 * @return {SequlizeInstance} user The user who was sent the email
 */
export function sendDestinationInfo(tripStatus, user, mailContent) {
    const mailOptions = {
        to: user.email,
        from: `A Drop in the Ocean <${config.email}>`,
        replyTo: config.email,
        template: 'info',
        context: {
            content: mailContent
        }
    };
    if (tripStatus === TRIP_STATUSES.REJECTED) {
        mailOptions.subject = 'Trip request denied - A Drop in the Ocean';
    } else if (tripStatus === TRIP_STATUSES.PENDING) {
        mailOptions.subject = 'Trip request received - A Drop in the Ocean';
    }
    return transporter.sendMailAsync(mailOptions)
        .then(() => user)
        .catch(handleError);
}

/**
 * sendDeactivationInfo - Sends an informational
 * e-mail to a user that has deactivated their profile
 *
 * @function sendDeactivationInfo
 * @memberof  module:components/mail
 * @param  {SequlizeInstance} user The user which is going to recive the email
 * @param  {string} mailContent The content of the info e-mail to be sent
 * @return {SequlizeInstance} user The user who was sent the email
 */
export function sendDeactivationInfo(user) {
    const content = `Dear, ${user.firstname} ${user.lastname}.
<p>
You've pressed the button to delete your profile with us. If you at any time
want to come back, just reregister at our
<a href="http://app.drapenihavet.no">website</a>. </br>
If you didn't delete your profile, please send us an
<a href="mailto:post@drapenihavet.no">e-mail</a> as soon as possible.
</p>
Thanks!`;
    const mailOptions = {
        to: user.email,
        from: `A Drop in the Ocean <${config.email}>`,
        replyTo: config.email,
        subject: 'Your profile has been deleted',
        template: 'info',
        context: { content }
    };
    return transporter.sendMailAsync(mailOptions)
        .then(() => user)
        .catch(handleError);
}


/**
 * sendCustomMail - Sends a custom email to the specified recipient
 *
 * @function sendCustomMail
 * @memberof  module:components/mail
 * @param  {object} recipient The recipient which is going to recive the email
 * @param  {object} mailData includes the message and subject of the email
 * @return {object} recipient The recipient who was sent the email
 */
export function sendCustomMail(recipient, mailData) {
    const mailOptions = {
        to: recipient.email,
        from: `A Drop in the Ocean <${config.email}>`,
        replyTo: config.email,
        subject: mailData.subject,
        template: 'info',
        context: {
            content: mailData.message
        }
    };

    return transporter.sendMailAsync(mailOptions)
        .then(() => recipient)
        .catch(error => {
            handleError(error);
            return Promise.reject({ ...recipient, error: error.cause.message });
        });
}
