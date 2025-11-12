// src/services/RestaurantService.js

const { pgPool } = require('../config');

class RestaurantService {
    
    /**
     * Crée un nouveau restaurant dans la base de données PostgreSQL.
     */
    async createRestaurant(data) {
        const { nom, adresse, description, capacite_max } = data;

        try {
            const query = `
                INSERT INTO restaurants (nom, adresse, description, capacite_max)
                VALUES ($1, $2, $3, $4)
                RETURNING id_restaurant, nom, adresse, description, capacite_max, created_at;
            `;
            const values = [nom, adresse, description, capacite_max];
            
            const result = await pgPool.query(query, values);
            return result.rows[0];

        } catch (error) {
            // Gestion spécifique des erreurs PostgreSQL
            if (error.code === '23505') { // Violation de contrainte unique
                const customError = new Error('Un restaurant avec ce nom existe déjà');
                customError.status = 409;
                throw customError;
            } else if (error.code === '23502') { // Violation de contrainte NOT NULL
                const customError = new Error('Données manquantes requises');
                customError.status = 400;
                throw customError;
            }
            throw error;
        }
    }

    /**
     * Récupère la liste de tous les restaurants.
     */
    async getAllRestaurants() {
        try {
            const query = `
                SELECT id_restaurant, nom, adresse, description, capacite_max, created_at
                FROM restaurants 
                ORDER BY nom ASC;
            `;
            
            const result = await pgPool.query(query);
            return result.rows;

        } catch (error) {
            const serviceError = new Error(`Erreur lors de la récupération des restaurants: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * Récupère un restaurant par son ID.
     */
    async getRestaurantById(id) {
        try {
            const query = `
                SELECT id_restaurant, nom, adresse, description, capacite_max, created_at
                FROM restaurants 
                WHERE id_restaurant = $1;
            `;
            
            const result = await pgPool.query(query, [id]);
            
            if (result.rows.length === 0) {
                const notFoundError = new Error('Restaurant non trouvé');
                notFoundError.status = 404;
                throw notFoundError;
            }
            
            return result.rows[0];

        } catch (error) {
            if (error.status === 404) throw error;
            
            const serviceError = new Error(`Erreur lors de la récupération du restaurant: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * Met à jour un restaurant existant.
     */
    async updateRestaurant(id, data) {
        const { nom, adresse, description, capacite_max } = data;

        try {
            const query = `
                UPDATE restaurants 
                SET nom = $1, adresse = $2, description = $3, capacite_max = $4, updated_at = CURRENT_TIMESTAMP
                WHERE id_restaurant = $5
                RETURNING id_restaurant, nom, adresse, description, capacite_max, created_at, updated_at;
            `;
            const values = [nom, adresse, description, capacite_max, id];
            
            const result = await pgPool.query(query, values);
            
            if (result.rows.length === 0) {
                const notFoundError = new Error('Restaurant non trouvé');
                notFoundError.status = 404;
                throw notFoundError;
            }
            
            return result.rows[0];

        } catch (error) {
            if (error.status === 404) throw error;
            
            if (error.code === '23505') {
                const customError = new Error('Un restaurant avec ce nom existe déjà');
                customError.status = 409;
                throw customError;
            }
            
            const serviceError = new Error(`Erreur lors de la mise à jour du restaurant: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * Supprime un restaurant.
     */
    async deleteRestaurant(id) {
        try {
            const query = `
                DELETE FROM restaurants 
                WHERE id_restaurant = $1
                RETURNING id_restaurant;
            `;
            
            const result = await pgPool.query(query, [id]);
            
            if (result.rows.length === 0) {
                const notFoundError = new Error('Restaurant non trouvé');
                notFoundError.status = 404;
                throw notFoundError;
            }

        } catch (error) {
            if (error.status === 404) throw error;
            
            // Gestion des contraintes de clé étrangère
            if (error.code === '23503') {
                const constraintError = new Error('Impossible de supprimer le restaurant : des réservations ou menus y sont associés');
                constraintError.status = 409;
                throw constraintError;
            }
            
            const serviceError = new Error(`Erreur lors de la suppression du restaurant: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }
}

// Export d'une instance du service
module.exports = new RestaurantService();