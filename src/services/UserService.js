// src/services/UserService.js

const { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } = require('../utils/authUtils');
const UserModel = require('../models/UserModel'); 

class UserService {

    /**
     * @description Enregistre un nouvel utilisateur (Inscription).
     */
    static async register(email, password, nom) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            const error = new Error("L'utilisateur existe déjà."); 
            error.status = 409; // Conflit
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
            error.status = 401; // Non autorisé
            throw error;
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            const error = new Error("Identifiants incorrects.");
            error.status = 401; // Non autorisé
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
     * CORRECTION: Ajouté pour corriger le TypeError dans userRoutes.js.
     */
    static async getAllUsers() {
        const users = await UserModel.findAll();
        // Nettoyage des données sensibles côté service
        return users.map(user => ({
            id: user.id_user,
            email: user.email,
            nom: user.nom,
            role: user.role
        }));
    }
    
    // ... Autres fonctions comme refresh, logout, updateProfile ...
}

module.exports = UserService;