import express from 'express';
import * as controller from '../controllers/mailTemplate.controller';
import { authorizeAdministrator } from '../components/auth';

const router = express.Router();

router.get('/', authorizeAdministrator, controller.list);

router.get('/:id/log', authorizeAdministrator, controller.retrieveAuditLog);

router.get('/:id', authorizeAdministrator, controller.retrieve);

router.post('/', authorizeAdministrator, controller.create);

router.delete('/:id', authorizeAdministrator, controller.destroy);

router.put('/:id', authorizeAdministrator, controller.update);

export default router;
