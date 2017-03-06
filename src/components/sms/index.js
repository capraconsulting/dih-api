/**
 * All functions and setup regarding sending sms.
 * @module components/sms
 */
import AWS from 'aws-sdk';
import Promise from 'bluebird';
import { handleError } from '../errors';
import config from '../../config';

let sns = new Promise.promisifyAll(new AWS.SNS({ region: config.region }));

/**
 * updateSNS - This function allows us to update the sns object to be used for testing.
 *
 * @function updateSNS
 * @memberof  module:components/sms
 * @param  {Object} sns the sns object we would like to use
 */
export function updateSNS(mockSns) {
    sns = Promise.promisifyAll(mockSns);
}

/**
 * sendSMS - Sends a custom sms to the specified recipient
 *
 * @function sendSMS
 * @memberof  module:components/mail
 * @param  {object} recipient The recipient which is going to recive the sms
 * @param  {object} smsData includes the message and subject of the sms
 * @return {object} recipient The recipient who was sent the sms
 */
export function sendSMS(recipient, smsData) {
    const params = {
        Message: smsData.message,
        MessageStructure: 'raw',
        PhoneNumber: recipient.phoneNumber,
        Subject: smsData.sender
    };

    // This is for allowing us to see the messages in development
    // And mocking a good response.
    if (config.nodeEnv === 'development') {
        console.log(params); // eslint-disable-line
        return Promise.resolve(recipient);
    }


    return sns.setSMSAttributesAsync({
        attributes: {
            DefaultSenderID: smsData.sender
        }
    })
    .then(() => sns.publishAsync(params))
    .then(() => recipient)
    .catch(error => {
        handleError(error);
        return Promise.reject({ ...recipient, error: error.cause.message });
    });
}
