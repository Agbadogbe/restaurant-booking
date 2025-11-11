// src/models/MenuModel.js

const mongoose = require('mongoose');

// Schéma pour les éléments individuels du menu (plats, boissons, etc.)
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: ['Entrée', 'Plat', 'Dessert', 'Boisson'] },
    isAvailable: { type: Boolean, default: true },
});

// Schéma principal du Menu (lié à un restaurant par ID)
const menuSchema = new mongoose.Schema({
    // Liaison avec la base PostgreSQL : 
    // On stocke l'ID relationnel du restaurant comme simple champ (pas de jointure)
    restaurantId: { 
        type: Number, 
        required: true, 
        unique: true, // Un seul document Menu par restaurant
        index: true
    },
    
    // Le menu est une liste d'éléments, une structure non rigide parfaite pour NoSQL
    items: [itemSchema], 
    
    // Métadonnées
    lastUpdated: { type: Date, default: Date.now },
});

// Crée et exporte le Modèle Menu
const MenuModel = mongoose.model('Menu', menuSchema);
module.exports = MenuModel;