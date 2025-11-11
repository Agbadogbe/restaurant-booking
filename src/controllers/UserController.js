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
                message: "Inscription réussie.",
                user: { id: user.id_user, email: user.email, role: user.role },
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
                message: "Connexion réussie.",
                user: { id: user.id_user, email: user.email, role: user.role },
                accessToken,
                refreshToken
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Gère la requête GET pour récupérer tous les utilisateurs.
     * CORRECTION: Ajouté pour corriger le TypeError dans userRoutes.js.
     */
    static async getAllUsers(req, res, next) {
        try {
            // NOTE: req.user contient l'ID et le Rôle de l'utilisateur authentifié.
            
            const users = await UserService.getAllUsers();

            res.status(200).json({
                message: "Liste des utilisateurs récupérée.",
                count: users.length,
                users
            });
        } catch (error) {
            next(error); 
        }
    }
    
    // ... Méthodes pour refresh_token, logout, etc. ...
}

module.exports = UserController;