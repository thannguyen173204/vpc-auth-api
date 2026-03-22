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
    
    const accessToken = jwt.sign(
        { user_id: user._id }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: process.env.ACCESS_TOKEN_TTL }
    );
    
    const refreshToken = uuid();
    const refreshTokenTTL = parseInt(process.env.REFESH_TOKEN_TTL, 10);
    
    await authServices.createSession({
        user_id: user._id,
        refresh_token: refreshToken,
        expires_in: new Date(Date.now() + refreshTokenTTL)
    });
    
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: refreshTokenTTL,
        sameSite: 'none',
        secure: true,
        path: '/'
    });
    
    // ĐÃ SỬA: Ném kèm thông tin user về cho Frontend
    return res.status(200).json({
        message: `User ${user.display_name} logged in.`,
        accessToken: accessToken,
        user: {
            _id: user._id,
            user_name: user.user_name,
            display_name: user.display_name,
            avt_url: user.avt_url || ""
        }
    });
});

export const Logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        await authServices.deleteSession({ refresh_token: refreshToken });
        
        // ĐÃ SỬA: Thêm cấu hình giống hệt lúc tạo để xóa được Cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/'
        });
    }
    res.sendStatus(204);
});

export const refreshToken = asyncHandler(async (req, res) => {
    const tokenFromCookie = req.cookies?.refreshToken; 

    if (!tokenFromCookie) {
        throw new ErrorResponse("Không tìm thấy Refresh Token. Vui lòng đăng nhập lại!", 401);
    }
    try {
        // ĐÃ SỬA: Đổi AuthService thành authServices cho đúng với import ở trên
        const newAccessToken = await authServices.refresh(tokenFromCookie);
        return res.status(200).json({ 
            message: 'Làm mới token thành công', 
            accessToken: newAccessToken 
        });
    } catch (error) {
        // ĐÃ SỬA: Thêm cấu hình giống hệt lúc tạo để xóa được Cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/'
        });
        throw new ErrorResponse(error.message, 401);
    }
});