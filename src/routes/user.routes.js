import { Router } from "express";
import {
  createPassword,
  updatePassword,
} from "../controllers/userController.js";

const router = Router();

router.post("/user", createPassword);
router.put("/user/:id", updatePassword);

export default router;
