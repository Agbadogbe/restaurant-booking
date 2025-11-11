// src/config.js
const { Pool } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuration PostgreSQL
const pgPool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

/**
 * @description Tente de se connecter à la base de données PostgreSQL.
 */
const connectPostgreSQL = async () => {
    try {
        await pgPool.query('SELECT NOW()'); // Simple requête pour tester la connexion
        console.log('✅ PostgreSQL : Connexion réussie à la base relationnelle.');
    } catch (error) {
        console.error('❌ PostgreSQL : Erreur de connexion !', error.message);
        // Vous pouvez décider de quitter l'application si la base principale n'est pas disponible
        // process.exit(1); 
    }
};

/**
 * @description Tente de se connecter à la base de données MongoDB.
 */
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB : Connexion réussie à la base complémentaire.');
    } catch (error) {
        console.error('❌ MongoDB : Erreur de connexion !', error.message);
    }
};

module.exports = {
    pgPool,
    connectPostgreSQL,
    connectMongoDB,
    // On peut aussi exporter d'autres constantes ou configurations ici si besoin
};