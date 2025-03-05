import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getMessages, getUsersForSidebar, sendMessage, stopTyping, typing } from '../controllers/message.controller.js';

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage)
router.post("/typing/:id", protectRoute, typing)
router.post("/stop-typing/:id", protectRoute, stopTyping)


export default router;