import express from 'express';
import { authorize, authorizeAdministrator } from '../components/auth';
import * as controller from '../controllers/trip.controller';

const router = express.Router();

router.get('/', authorize, controller.list);

router.get('/:id', authorize, controller.retrieve);

router.post('/', authorize, controller.create);

router.delete('/:id', authorizeAdministrator, controller.destroy);

router.put('/:id', authorize, controller.update);

export default router;
