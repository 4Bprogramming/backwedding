import { Router } from 'express';
import { getAllMediaHandler } from '../controllers/media.controller.js';

const mediaRouter = Router();
mediaRouter.get('/media', getAllMediaHandler);

export default mediaRouter;