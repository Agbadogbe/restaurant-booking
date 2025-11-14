// 🧩 tests/setup.test.js

const app = require('../src/app');
const { getPgPool, connectPostgreSQL, connectMongoDB, checkDatabaseStatus } = require('../src/config');
const request = require('supertest');

// Variables globales pour les tests
global.testUser = {
    email: "test.user@example.com",
    password: "Password123",
    nom: "UtilisateurTest",
    accessToken: null,
    refreshToken: null,
    id: null,
};

// Nettoyage initial avant TOUS les tests
before(async () => {
    console.log('🚀 Initialisation des tests...');
    
    try {
        // 1. Initialiser les bases de données
        await connectPostgreSQL();
        await connectMongoDB();
        
        // 2. Récupérer le pool maintenant qu'il est initialisé
        const pgPool = getPgPool();
        global.pgPool = pgPool;
        
        // 3. Rendre l'app disponible globalement
        global.request = request(app);
        
        // 4. Nettoyage des tables
        console.log('🧹 Nettoyage initial des tables...');
        await pgPool.query('TRUNCATE TABLE users, restaurants, reservations RESTART IDENTITY CASCADE;');
        console.log('✅ Base de test propre et prête.');

        // 5. Vérifier l'état de la base
        await checkDatabaseStatus();
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des tests:', error);
        throw error;
    }
});

// Nettoyage et fermeture du pool à la fin de tous les tests
after(async () => {
    console.log('🧩 Fermeture des connexions...');
    
    if (global.pgPool) {
        await global.pgPool.end();
        console.log('✅ Pool PostgreSQL fermé.');
    }
});