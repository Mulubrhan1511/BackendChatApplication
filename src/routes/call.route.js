import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';

import { handleIceCandidate, handleEndCall, handleAnswerCall } from '../controllers/call.controller.js';
const router = express.Router();


router.post("/ice-candidate/:id", protectRoute, handleIceCandidate);
router.post("/answer-call/:id", protectRoute, handleAnswerCall);
router.post("/end-call/:id", protectRoute, handleEndCall);


export default router;