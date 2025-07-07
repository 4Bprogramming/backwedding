import {Router} from 'express';
import {getVideos, updateVideo , createVideo, getVideoId, deleteVideo} from '../controllers/videoController.js';


const router = Router();

router.get('/video', getVideos) 
router.get('/video/:id', getVideoId)
router.post('/video', createVideo )
router.put('/video/:id', updateVideo)
router.delete('/video/:id', deleteVideo)





export default router;