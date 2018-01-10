import express from 'express';
import { authorizeAdministrator } from '../components/auth';
import AdminValueController from '../controllers/adminValue.controller';

const router = express.Router();

const controller = new AdminValueController();

router.post('/', authorizeAdministrator, controller.create);
router.put('/', authorizeAdministrator, controller.update);
router.get('/', controller.list);
router.get('/:id', controller.retrieve);

export default router;
