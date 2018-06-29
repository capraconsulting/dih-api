import express from 'express';
import { authorizeModerator } from '../components/auth';
import * as controller from '../controllers/user.controller';

const router = express.Router();

router.get('/', authorizeModerator, controller.list);

router.get('/:id', authorizeModerator, controller.retrieve);

router.put('/:id', authorizeModerator, controller.update);

router.post('/', controller.create);

router.get('/:id', controller.retrieve);

router.post('/', controller.create);

export default router;
