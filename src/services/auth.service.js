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
        const session = await Session.findOne({ refresh_token: oldRefreshToken });

        if (!session) {
            throw new Error("Phiên đăng nhập không tồn tại hoặc đã bị thu hồi");
        }

        if (session.expires_in < new Date()) {
            await Session.deleteOne({ _id: session._id });
            throw new Error("Refresh Token đã hết hạn. Vui lòng đăng nhập lại");
        }

        const newAccessToken = jwt.sign(
            { user_id: session.user_id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_TTL }
        );

        return newAccessToken;
    }
}

export default new AuthService();