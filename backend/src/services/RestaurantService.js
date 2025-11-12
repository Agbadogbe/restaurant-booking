// src/services/RestaurantService.js

const { getPgPool } = require('../config');
const RestaurantModel = require('../models/RestaurantModel');

class RestaurantService {
    
    /**
     * Crée un nouveau restaurant dans la base de données PostgreSQL.
     */
    static async createRestaurant(data) {
        const { nom, adresse, description, capacite_max } = data;

        try {
            return await RestaurantModel.create({
                nom, 
                adresse, 
                description, 
                capacite_max
            });

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
            
            // Erreur générique
            const serviceError = new Error(`Erreur lors de la création du restaurant: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * Récupère la liste de tous les restaurants.
     */
    static async getAllRestaurants() {
        try {
            return await RestaurantModel.findAll();
        } catch (error) {
            const serviceError = new Error(`Erreur lors de la récupération des restaurants: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * Récupère un restaurant par son ID.
     */
    static async getRestaurantById(id) {
        try {
            const restaurant = await RestaurantModel.findById(id);
            
            if (!restaurant) {
                const notFoundError = new Error('Restaurant non trouvé');
                notFoundError.status = 404;
                throw notFoundError;
            }
            
            return restaurant;

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
    static async updateRestaurant(id, data) {
        try {
            const restaurant = await RestaurantModel.update(id, data);
            
            if (!restaurant) {
                const notFoundError = new Error('Restaurant non trouvé');
                notFoundError.status = 404;
                throw notFoundError;
            }
            
            return restaurant;

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
    static async deleteRestaurant(id) {
        try {
            const result = await RestaurantModel.delete(id);
            
            if (!result) {
                const notFoundError = new Error('Restaurant non trouvé');
                notFoundError.status = 404;
                throw notFoundError;
            }

            return result;

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

    /**
     * Recherche des restaurants par nom.
     */
    static async searchRestaurants(nom) {
        try {
            return await RestaurantModel.searchByName(nom);
        } catch (error) {
            const serviceError = new Error(`Erreur lors de la recherche des restaurants: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * Récupère les restaurants par capacité.
     */
    static async getRestaurantsByCapacity(min, max) {
        try {
            return await RestaurantModel.findByCapacity(min, max);
        } catch (error) {
            const serviceError = new Error(`Erreur lors du filtrage par capacité: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * Récupère les statistiques des restaurants.
     */
    static async getRestaurantStats() {
        try {
            return await RestaurantModel.getStats();
        } catch (error) {
            const serviceError = new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }
}

// Export de la classe avec méthodes statiques
module.exports = RestaurantService;