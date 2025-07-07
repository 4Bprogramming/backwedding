import {Router} from 'express';
import {createPhoto, updatePhoto, getPhotos, getPhotoId, deletePhoto} from '../controllers/photoController.js';

const router = Router();

router.get('/photo', getPhotos) 
router.get('/photo/:id', getPhotoId)
router.post('/photo',  createPhoto)
router.put('/photo/:id',updatePhoto )
router.delete('/photo/:id', deletePhoto)



export default router;