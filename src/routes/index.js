import express from 'express';
import raven from 'raven';
import account from './account.routes';
import user from './user.routes';
import authenticate from './authenticate.routes';
import destination from './destination.routes';
import mailTemplate from './mailTemplate.routes';
import message from './message.routes';
import trip from './trip.routes';
import { pageNotFoundMiddleware, sentryClient, errorMiddleware } from '../components/errors';
import config from '../config';

const router = express.Router();

router.use('/authenticate', authenticate);
router.use('/account', account);
router.use('/users', user);
router.use('/destinations', destination);
router.use('/trips', trip);
router.use('/mailtemplates', mailTemplate);
router.use('/messages', message);

router.use(pageNotFoundMiddleware);

if (config.env === 'production' || config.env === 'staging') {
    router.use(raven.errorHandler(sentryClient));
}

router.use(errorMiddleware);

export default router;
