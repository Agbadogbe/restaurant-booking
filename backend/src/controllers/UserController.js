// src/controllers/UserController.js

const UserService = require('../services/UserService');

class UserController {
    
    /**
     * @description Gère la requête d'inscription (POST /api/users/register).
     */
    static async register(req, res, next) {
        try {
            const { email, password, nom } = req.body;
            
            const { user, accessToken, refreshToken } = await UserService.register(email, password, nom);

            res.status(201).json({
                success: true,
                message: "Inscription réussie.",
                user: { 
                    id: user.id_user, 
                    email: user.email, 
                    nom: user.nom,
                    role: user.role 
                },
                accessToken,
                refreshToken
            });
        } catch (error) {
            next(error); 
        }
    }

    /**
     * @description Gère la requête de connexion (POST /api/users/login).
     */
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const { user, accessToken, refreshToken } = await UserService.login(email, password);

            res.status(200).json({
                success: true,
                message: "Connexion réussie.",
                user: { 
                    id: user.id_user, 
                    email: user.email, 
                    nom: user.nom,
                    role: user.role 
                },
                accessToken,
                refreshToken
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Gère la requête GET pour récupérer tous les utilisateurs.
     */
    static async getAllUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers();

            res.status(200).json({
                success: true,
                message: "Liste des utilisateurs récupérée.",
                count: users.length,
                users
            });
        } catch (error) {
            next(error); 
        }
    }

    /**
     * @description Gère la requête GET pour récupérer le profil utilisateur.
     */
    static async getProfile(req, res, next) {
        try {
            const user = await UserService.getUserById(req.user.id);
            
            res.status(200).json({
                success: true,
                user: {
                    id: user.id_user,
                    email: user.email,
                    nom: user.nom,
                    role: user.role,
                    created_at: user.created_at
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Gère le rafraîchissement du token.
     */
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            
            if (!refreshToken) {
                const error = new Error('Refresh token requis');
                error.status = 400;
                throw error;
            }

            const { newAccessToken, newRefreshToken } = await UserService.refreshToken(refreshToken);

            res.status(200).json({
                success: true,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * @description Gère la déconnexion.
     */
    static async logout(req, res, next) {
        try {
            const userId = req.user.id;
            await UserService.invalidateRefreshToken(userId);
            
            res.status(200).json({
                success: true,
                message: "Déconnexion réussie."
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;