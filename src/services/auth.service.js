import User from "../models/user.model.js"
import Session from "../models/session.model.js"
import bcrypt from 'bcrypt';
import DatabaseService from "./db.service.js";

class AuthService {
    findUser = async (data) => {
        return await DatabaseService.find(User, data);
    }
    comparePassword = async (password, hashedPassword) => {
        return await bcrypt.compare(password, hashedPassword);
    }

    hashPassword = async (password) => {
        return await bcrypt.hash(password, 10);
    }

    register = async (data) => {
        return await DatabaseService.create(User, data);
    }
    createDatabase = async (model, data) => {
        return await DatabaseService.create(model, data);
    }
    createSession = async (value) => {
        return await this.createDatabase(Session, value);
    }

    deleteSession = async (data) => {
        return await DatabaseService.delete(Session, data);
    }
    refresh = async (oldRefreshToken) => {
        let decoded;
        try {
            decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (error) {
            await Session.deleteOne({ refresh_token: oldRefreshToken });
            throw new Error("Refresh Token không hợp lệ hoặc đã hết hạn");
        }

        const session = await Session.findOne({ refresh_token: oldRefreshToken, user_id: decoded.user_id });

        if (!session) {
            throw new Error("Phiên đăng nhập không tồn tại hoặc đã bị thu hồi");
        }

        const newAccessToken = jwt.sign(
            { user_id: decoded.user_id }, // Payload phải giống hệt lúc bạn tạo ở hàm login
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' } // Tuổi thọ ngắn: 15 phút
        );

        return newAccessToken;
    }
}

export default new AuthService();