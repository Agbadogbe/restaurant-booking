// tests/setup.test.js (Extrait)

const app = require('../src/app'); // <-- Le changement ici est CRUCIAL
const { pgPool } = require('../src/config'); 
const request = require('supertest');

// Variables globales pour les tests (tokens, IDs)
global.request = request(app); // Supertest utilise l'objet 'app' brut
global.pgPool = pgPool;

// ... (le reste du fichier reste inchangé) ...

// Variables pour l'authentification de test
global.testUser = {
    email: "test.user@example.com",
    password: "Password123", // Doit respecter le schéma de validation !
    nom: "UtilisateurTest",
    accessToken: null,
    refreshToken: null,
    id: null,
};

// Hook pour nettoyer la base de données avant chaque suite
before(async () => {
    // ⚠️ ATTENTION : Ceci EST DÉSTRUCTEUR. 
    // Assurez-vous d'utiliser une base de données de test dédiée (test_restaurant_db)
    
    // Suppression des données utilisateur et de token avant les tests
    await pgPool.query('DELETE FROM users WHERE email = $1', [global.testUser.email]);
    console.log("Pré-nettoyage des données terminé.");
});

// Hook pour garantir que les connexions sont fermées après tous les tests
after(async () => {
    // Si vous utilisez une fonction de déconnexion dans config.js, utilisez-la ici
    // Exemple : await disconnectPostgreSQL();
    console.log("Fermeture du pool de connexion PostgreSQL.");
});