// src/models/UserModel.js

const { pgPool } = require('../config');

class UserModel {
    
    /**
     * @description Recherche un utilisateur par son email.
     */
    static async findByEmail(email) {
        // Sélectionne les champs nécessaires, y compris le hash pour la connexion
        const query = 'SELECT id_user, email, password_hash, role FROM users WHERE email = $1';
        const result = await pgPool.query(query, [email]);
        return result.rows[0]; // Renvoie le premier utilisateur trouvé ou undefined
    }

    /**
     * @description Crée un nouvel utilisateur dans la base de données.
     */
    static async create({ email, password_hash, nom, role }) {
        const query = `
            INSERT INTO users (email, password_hash, nom, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id_user, email, nom, role, created_at
        `;
        const values = [email, password_hash, nom, role];
        const result = await pgPool.query(query, values);
        return result.rows[0];
    }
    
    /**
     * @description Stocke ou met à jour le refresh token de l'utilisateur.
     * Crucial pour la gestion stricte des tokens.
     */
    static async saveRefreshToken(userId, refreshToken) {
        const query = 'UPDATE users SET refresh_token = $1 WHERE id_user = $2';
        await pgPool.query(query, [refreshToken, userId]);
    }

    /**
     * @description Récupère tous les utilisateurs (pour les administrateurs).
     * CORRECTION: Ajouté pour corriger le TypeError dans userRoutes.js.
     */
    static async findAll() {
        // Ne récupère PAS le password_hash ni le refresh_token
        const query = 'SELECT id_user, email, nom, role FROM users';
        const result = await pgPool.query(query);
        return result.rows; 
    }
}

module.exports = UserModel;