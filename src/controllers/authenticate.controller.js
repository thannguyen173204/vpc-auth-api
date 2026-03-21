import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import authServices from '../services/auth.service.js';
import asyncHandler from 'express-async-handler';
import { ErrorResponse } from '../middlewares/error.middleware.js';

export const Register = asyncHandler(async (req, res, next) => {
    const { username, password, firstname, lastname } = req.body;
    if (!username || !password || !firstname || !lastname) {
        throw new ErrorResponse("Vui lòng điền đủ nội dung", 400);
    }
    const duplicate = await authServices.findUser({ user_name: username });
    if (duplicate) {
        throw new ErrorResponse("User đã tồn tại", 409);
    }
    const hashed_password = await authServices.hashPassword(password);
    await authServices.register({
        user_name: username,
        display_name: `${firstname} ${lastname}`,
        hashed_password
    })
    return res.sendStatus(204);
});
export const Login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        throw new ErrorResponse("Vui lòng điền đủ nội dung", 400);
    }
    const user = await authServices.findUser({ user_name: username });
    if (!user) {
        throw new ErrorResponse("User không tồn tại", 404);
    }
    const match = await authServices.comparePassword(password, user.hashed_password);
    if (!match) {
        throw new ErrorResponse("Mật khẩu không đúng", 401);
    }
    const accessToken = jwt.sign({ user_id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL });
    const refreshToken = uuid();
    const refreshTokenTTL = parseInt(process.env.REFESH_TOKEN_TTL, 10);
    await authServices.createSession({
        user_id: user._id,
        refresh_token: refreshToken,
        expires_in: new Date(Date.now() + refreshTokenTTL)
    })
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: process.env.REFESH_TOKEN_TTL,
        samesite: 'none',
        secure: true
    });
    return res.status(200).json({
        messeage: `User ${user.display_name} logged in.`,
        accessToken: accessToken
    });

})
export const Logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        await authServices.deleteSession({ refresh_token: refreshToken });
        res.clearCookie('refreshToken');
    }
    res.sendStatus(204);
});