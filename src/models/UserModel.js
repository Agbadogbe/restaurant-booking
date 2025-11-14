// src/models/UserModel.js

const { getPgPool } = require('../config');

class UserModel {
    
    /**
     * @description Recherche un utilisateur par son email.
     */
    static async findByEmail(email) {
        const pgPool = getPgPool();
        const query = 'SELECT id_user, email, password_hash, role, nom, refresh_token FROM users WHERE email = $1';
        const result = await pgPool.query(query, [email]);
        return result.rows[0];
    }

    /**
     * @description Recherche un utilisateur par son ID.
     */
    static async findById(userId) {
        const pgPool = getPgPool();
        const query = 'SELECT id_user, email, nom, role, created_at, refresh_token FROM users WHERE id_user = $1';
        const result = await pgPool.query(query, [userId]);
        return result.rows[0];
    }

    /**
     * @description Crée un nouvel utilisateur dans la base de données.
     */
    static async create({ email, password_hash, nom, role }) {
        const pgPool = getPgPool();
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
     */
    static async saveRefreshToken(userId, refreshToken) {
        const pgPool = getPgPool();
        const query = 'UPDATE users SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id_user = $2';
        await pgPool.query(query, [refreshToken, userId]);
    }

    /**
     * @description Supprime le refresh token (logout).
     */
    static async removeRefreshToken(userId) {
        const pgPool = getPgPool();
        const query = 'UPDATE users SET refresh_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id_user = $1';
        await pgPool.query(query, [userId]);
    }

    /**
     * @description Récupère tous les utilisateurs.
     */
    static async findAll() {
        const pgPool = getPgPool();
        const query = 'SELECT id_user, email, nom, role, created_at FROM users ORDER BY created_at DESC';
        const result = await pgPool.query(query);
        return result.rows; 
    }

    /**
     * @description Met à jour le profil utilisateur.
     */
    static async updateProfile(userId, { nom, email }) {
        const pgPool = getPgPool();
        const query = `
            UPDATE users 
            SET nom = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id_user = $3
            RETURNING id_user, email, nom, role, created_at, updated_at
        `;
        const values = [nom, email, userId];
        const result = await pgPool.query(query, values);
        return result.rows[0];
    }

    /**
     * @description Change le mot de passe utilisateur.
     */
    static async updatePassword(userId, passwordHash) {
        const pgPool = getPgPool();
        const query = 'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id_user = $2';
        await pgPool.query(query, [passwordHash, userId]);
    }

    /**
     * @description Vérifie si un email existe déjà (pour l'inscription).
     */
    static async emailExists(email) {
        const pgPool = getPgPool();
        const query = 'SELECT 1 FROM users WHERE email = $1';
        const result = await pgPool.query(query, [email]);
        return result.rows.length > 0;
    }
}

module.exports = UserModel;