import { Router } from "express";
import { createCloudinary, deleteFromCloudinary, updateCloudinary } from "../controllers/cloudinaryController.js";

const cloudinaryRouter = Router();

cloudinaryRouter.post("/cloudinary", createCloudinary);
cloudinaryRouter.delete('/cloudinary', deleteFromCloudinary);
cloudinaryRouter.put('/cloudinary/:id', updateCloudinary);

export default cloudinaryRouter;