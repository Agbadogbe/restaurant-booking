// src/services/UserService.js

const { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } = require('../utils/authUtils');
const UserModel = require('../models/UserModel'); 
const jwt = require('jsonwebtoken');

class UserService {

    /**
     * @description Enregistre un nouvel utilisateur (Inscription).
     */
    static async register(email, password, nom) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            const error = new Error("L'utilisateur existe déjà."); 
            error.status = 409;
            throw error;
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await UserModel.create({
            email,
            password_hash: hashedPassword,
            nom,
            role: 'Client' 
        });

        const payload = { 
            id: newUser.id_user, 
            role: newUser.role 
        };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await UserModel.saveRefreshToken(newUser.id_user, refreshToken);

        return { user: newUser, accessToken, refreshToken };
    }

    /**
     * @description Gère la connexion de l'utilisateur (Login).
     */
    static async login(email, password) {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            const error = new Error("Identifiants incorrects.");
            error.status = 401;
            throw error;
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            const error = new Error("Identifiants incorrects.");
            error.status = 401;
            throw error;
        }

        const payload = { 
            id: user.id_user, 
            role: user.role 
        };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        
        await UserModel.saveRefreshToken(user.id_user, refreshToken);

        return { user, accessToken, refreshToken };
    }
    
    /**
     * @description Récupère tous les utilisateurs depuis la base de données.
     */
    static async getAllUsers() {
        const users = await UserModel.findAll();
        return users.map(user => ({
            id: user.id_user,
            email: user.email,
            nom: user.nom,
            role: user.role,
            created_at: user.created_at
        }));
    }

    /**
     * @description Récupère un utilisateur par son ID.
     */
    static async getUserById(userId) {
        const user = await UserModel.findById(userId);
        if (!user) {
            const error = new Error("Utilisateur non trouvé.");
            error.status = 404;
            throw error;
        }
        return user;
    }

    /**
     * @description Rafraîchit le token d'accès.
     */
    static async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await UserModel.findById(decoded.id);
            
            if (!user || user.refresh_token !== refreshToken) {
                const error = new Error("Refresh token invalide.");
                error.status = 403;
                throw error;
            }

            const payload = { 
                id: user.id_user, 
                role: user.role 
            };
            const newAccessToken = generateAccessToken(payload);
            const newRefreshToken = generateRefreshToken(payload);
            
            await UserModel.saveRefreshToken(user.id_user, newRefreshToken);

            return { newAccessToken, newRefreshToken };

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                const jwtError = new Error("Refresh token invalide.");
                jwtError.status = 403;
                throw jwtError;
            }
            if (error.name === 'TokenExpiredError') {
                const expiredError = new Error("Refresh token expiré.");
                expiredError.status = 403;
                throw expiredError;
            }
            throw error;
        }
    }

    /**
     * @description Invalide le refresh token lors de la déconnexion.
     */
    static async invalidateRefreshToken(userId) {
        await UserModel.saveRefreshToken(userId, null);
    }
}

module.exports = UserService;