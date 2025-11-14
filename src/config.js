// src/config.js
const { Pool } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

let pgPool = null;
let isInitialized = false;

// Configuration PostgreSQL de base (sans base spécifique pour créer la DB)
const createAdminPool = () => {
    return new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
        database: 'postgres'
    });
};

/**
 * @description Crée la base de données si elle n'existe pas
 */
const createDatabaseIfNotExists = async () => {
    const adminPool = createAdminPool();
    
    try {
        console.log('🔄 Vérification de la base de données...');
        
        const result = await adminPool.query(`
            SELECT 1 FROM pg_database WHERE datname = $1
        `, [process.env.PGDATABASE]);
        
        if (result.rows.length === 0) {
            console.log('🗄️  Création de la base de données...');
            await adminPool.query(`CREATE DATABASE ${process.env.PGDATABASE}`);
            console.log('✅ Base de données créée:', process.env.PGDATABASE);
        } else {
            console.log('✅ Base de données existe déjà:', process.env.PGDATABASE);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la création de la base:', error.message);
        throw error;
    } finally {
        await adminPool.end();
    }
};

/**
 * @description Crée les tables si elles n'existent pas
 */
const createTablesIfNotExist = async () => {
    try {
        console.log('📊 Vérification des tables...');
        
        const createTablesSQL = `
            CREATE TABLE IF NOT EXISTS users (
                id_user SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                nom VARCHAR(100) NOT NULL,
                role VARCHAR(20) DEFAULT 'Client' CHECK (role IN ('Client', 'Admin', 'Manager')),
                refresh_token TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS restaurants (
                id_restaurant SERIAL PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                adresse VARCHAR(255) NOT NULL,
                description TEXT,
                capacite_max INTEGER NOT NULL CHECK (capacite_max > 0),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS reservations (
                id_reservation SERIAL PRIMARY KEY,
                id_user INTEGER NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
                id_restaurant INTEGER NOT NULL REFERENCES restaurants(id_restaurant) ON DELETE CASCADE,
                date_reservation TIMESTAMP NOT NULL,
                nombre_personnes INTEGER NOT NULL CHECK (nombre_personnes > 0),
                statut VARCHAR(20) DEFAULT 'confirmée' CHECK (statut IN ('confirmée', 'en attente', 'annulée', 'terminée')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
            CREATE INDEX IF NOT EXISTS idx_restaurants_nom ON restaurants(nom);
            CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(id_user);
            CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON reservations(id_restaurant);
            CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date_reservation);
        `;

        await pgPool.query(createTablesSQL);
        console.log('✅ Tables vérifiées/créées avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de la création des tables:', error.message);
        throw error;
    }
};

/**
 * @description Tente de se connecter à la base de données PostgreSQL avec création automatique
 */
const connectPostgreSQL = async () => {
    try {
        // 1. Créer la base de données si elle n'existe pas
        await createDatabaseIfNotExists();
        
        // 2. Maintenant initialiser le pool avec la bonne base
        pgPool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT,
        });

        // 3. Créer les tables si elles n'existent pas
        await createTablesIfNotExist();
        
        // 4. Tester la connexion
        await pgPool.query('SELECT NOW()');
        console.log('✅ PostgreSQL : Connexion réussie à la base relationnelle.');
        
        // 5. Marquer comme initialisé
        isInitialized = true;
        
    } catch (error) {
        console.error('❌ PostgreSQL : Erreur de connexion !', error.message);
        throw error;
    }
};

/**
 * @description Tente de se connecter à MongoDB Atlas.
 */
const connectMongoDB = async () => {
    try {
        console.log('🔄 Tentative de connexion à MongoDB Atlas...');
        
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI est undefined - vérifiez votre fichier .env');
        }
        
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('✅ MongoDB Atlas : Connexion réussie !');
        console.log('📊 Base de données:', mongoose.connection.db.databaseName);
        
    } catch (error) {
        console.error('❌ MongoDB Atlas : Erreur de connexion !', error.message);
    }
};

/**
 * @description Vérifie l'état de la base de données
 */
const checkDatabaseStatus = async () => {
    try {
        const usersCount = await pgPool.query('SELECT COUNT(*) FROM users');
        const restaurantsCount = await pgPool.query('SELECT COUNT(*) FROM restaurants');
        const reservationsCount = await pgPool.query('SELECT COUNT(*) FROM reservations');
        
        console.log('\n📊 État de la base de données:');
        console.log(`   👥 Utilisateurs: ${usersCount.rows[0].count}`);
        console.log(`   🍽️  Restaurants: ${restaurantsCount.rows[0].count}`);
        console.log(`   🗓️  Réservations: ${reservationsCount.rows[0].count}`);
        
    } catch (error) {
        console.log('📊 Base de données vide ou erreur de lecture');
    }
};

/**
 * @description Getter sécurisé pour pgPool
 */
const getPgPool = () => {
    if (!isInitialized || !pgPool) {
        throw new Error('PostgreSQL non initialisé. Appelez await connectPostgreSQL() d\'abord.');
    }
    return pgPool;
};

module.exports = {
    getPgPool,
    connectPostgreSQL,
    connectMongoDB,
    checkDatabaseStatus,
    isInitialized: () => isInitialized
};