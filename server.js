// server.js

// 1. Importation des modules
require('dotenv').config(); 
const app = require('./src/app'); // <-- Importe l'application Express définie dans app.js
    
// Import des fonctions de connexion
const connectPostgreSQL = require('./src/config').connectPostgreSQL; 
const connectMongoDB = require('./src/config').connectMongoDB; 

// 2. Connexion aux bases de données
connectPostgreSQL();
connectMongoDB();    

// 3. Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});