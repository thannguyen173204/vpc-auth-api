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
}

export default new AuthService();