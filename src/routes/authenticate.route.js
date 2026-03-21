import express from 'express';
import { Login, Logout, Register, refreshToken } from '../controllers/authenticate.controller.js';

export const authenticateRoute = express.Router();
authenticateRoute.post('/login', Login);
authenticateRoute.post('/register', Register);
authenticateRoute.post('/logout', Logout);
authRoute.post('/refresh', refreshToken);
