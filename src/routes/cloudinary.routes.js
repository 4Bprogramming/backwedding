import { Router } from "express";
import { createCloudinary, deleteFromCloudinary } from "../controllers/cloudinaryController.js";

const cloudinaryRouter = Router();

cloudinaryRouter.post("/cloudinary", createCloudinary);
cloudinaryRouter.delete('/cloudinary', deleteFromCloudinary);

export default cloudinaryRouter;