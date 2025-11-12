// src/models/RestaurantModel.js

const { getPgPool } = require('../config');

class RestaurantModel {
    
    /**
     * @description Crée un nouveau restaurant
     */
    static async create({ nom, adresse, description, capacite_max }) {
        const pgPool = getPgPool();
        const query = `
            INSERT INTO restaurants (nom, adresse, description, capacite_max)
            VALUES ($1, $2, $3, $4)
            RETURNING id_restaurant, nom, adresse, description, capacite_max, created_at;
        `;
        const values = [nom, adresse, description, capacite_max];
        const result = await pgPool.query(query, values);
        return result.rows[0];
    }

    /**
     * @description Récupère tous les restaurants
     */
    static async findAll() {
        const pgPool = getPgPool();
        const query = `
            SELECT id_restaurant, nom, adresse, description, capacite_max, created_at
            FROM restaurants 
            ORDER BY nom ASC;
        `;
        const result = await pgPool.query(query);
        return result.rows;
    }

    /**
     * @description Récupère un restaurant par son ID
     */
    static async findById(id) {
        const pgPool = getPgPool();
        const query = `
            SELECT id_restaurant, nom, adresse, description, capacite_max, created_at
            FROM restaurants 
            WHERE id_restaurant = $1;
        `;
        const result = await pgPool.query(query, [id]);
        return result.rows[0];
    }

    /**
     * @description Met à jour un restaurant
     */
    static async update(id, { nom, adresse, description, capacite_max }) {
        const pgPool = getPgPool();
        const query = `
            UPDATE restaurants 
            SET nom = $1, adresse = $2, description = $3, capacite_max = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id_restaurant = $5
            RETURNING id_restaurant, nom, adresse, description, capacite_max, created_at, updated_at;
        `;
        const values = [nom, adresse, description, capacite_max, id];
        const result = await pgPool.query(query, values);
        return result.rows[0];
    }

    /**
     * @description Supprime un restaurant
     */
    static async delete(id) {
        const pgPool = getPgPool();
        const query = `
            DELETE FROM restaurants 
            WHERE id_restaurant = $1
            RETURNING id_restaurant;
        `;
        const result = await pgPool.query(query, [id]);
        return result.rows[0];
    }

    /**
     * @description Recherche des restaurants par nom
     */
    static async searchByName(nom) {
        const pgPool = getPgPool();
        const query = `
            SELECT id_restaurant, nom, adresse, description, capacite_max
            FROM restaurants 
            WHERE nom ILIKE $1
            ORDER BY nom ASC;
        `;
        const result = await pgPool.query(query, [`%${nom}%`]);
        return result.rows;
    }

    /**
     * @description Récupère les restaurants par capacité
     */
    static async findByCapacity(min, max) {
        const pgPool = getPgPool();
        const query = `
            SELECT id_restaurant, nom, adresse, description, capacite_max
            FROM restaurants 
            WHERE capacite_max BETWEEN $1 AND $2
            ORDER BY capacite_max ASC;
        `;
        const result = await pgPool.query(query, [min, max]);
        return result.rows;
    }

    /**
     * @description Récupère les statistiques des restaurants
     */
    static async getStats() {
        const pgPool = getPgPool();
        const query = `
            SELECT 
                COUNT(*) as total_restaurants,
                AVG(capacite_max) as capacite_moyenne,
                MAX(capacite_max) as capacite_maximale,
                MIN(capacite_max) as capacite_minimale,
                SUM(capacite_max) as capacite_totale
            FROM restaurants;
        `;
        const result = await pgPool.query(query);
        return result.rows[0];
    }

    /**
     * @description Vérifie si un restaurant existe
     */
    static async exists(restaurantId) {
        const pgPool = getPgPool();
        const query = 'SELECT 1 FROM restaurants WHERE id_restaurant = $1';
        const result = await pgPool.query(query, [restaurantId]);
        return result.rows.length > 0;
    }

    /**
     * @description Récupère les restaurants avec pagination
     */
    static async findWithPagination(limit = 10, offset = 0) {
        const pgPool = getPgPool();
        const query = `
            SELECT id_restaurant, nom, adresse, description, capacite_max, created_at
            FROM restaurants 
            ORDER BY nom ASC
            LIMIT $1 OFFSET $2;
        `;
        const result = await pgPool.query(query, [limit, offset]);
        return result.rows;
    }

    /**
     * @description Compte le nombre total de restaurants
     */
    static async count() {
        const pgPool = getPgPool();
        const query = 'SELECT COUNT(*) FROM restaurants';
        const result = await pgPool.query(query);
        return parseInt(result.rows[0].count);
    }
}

module.exports = RestaurantModel;