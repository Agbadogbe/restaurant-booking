// server.js

// 1. Importation des modules
require('dotenv').config(); 
const app = require('./src/app');
    
// Import des fonctions de connexion
const { connectPostgreSQL, connectMongoDB, checkDatabaseStatus } = require('./src/config');

/**
 * @description Démarrage sécurisé de l'application
 */
async function startServer() {
    try {
        console.log('🚀 Démarrage du serveur...\n');

        // 1. Connexion à PostgreSQL (crée la DB si nécessaire)
        await connectPostgreSQL();
        
        // 2. Connexion à MongoDB
        await connectMongoDB();
        
        // 3. Vérifier l'état de la base
        await checkDatabaseStatus();

        // 4. Démarrer le serveur
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`\n🎉 Server is running on port ${PORT}`);
            console.log(`📚 API disponible sur: http://localhost:${PORT}/api`);
            console.log('\n🔗 Endpoints principaux:');
            console.log('   POST /api/users/register - Inscription');
            console.log('   POST /api/users/login - Connexion');
            console.log('   GET  /api/restaurants - Liste restaurants');
            console.log('   POST /api/reservations - Créer réservation');
        });

    } catch (error) {
        console.error('\n❌ Erreur critique lors du démarrage:', error.message);
        console.log('💡 Vérifiez votre configuration PostgreSQL dans le fichier .env');
        process.exit(1);
    }
}

// Gestion propre des arrêts
process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt du serveur...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Arrêt du serveur...');
    process.exit(0);
});

// Démarrer le serveur
startServer();