import express from 'express';
import { verifyToken } from '../middlewares/verify.middleware.js';
export const userRoute = express.Router();
userRoute.get('/me', (req, res) => {
    console.log('gotcha');
    res.status(200).json({ 'user': 'me' })
});