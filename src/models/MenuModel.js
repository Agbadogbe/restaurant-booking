// src/models/MenuModel.js

const mongoose = require('mongoose');

// Schéma pour les éléments individuels du menu
const itemSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: false,
        trim: true
    },
    price: { 
        type: Number, 
        required: true,
        min: 0
    },
    category: { 
        type: String, 
        required: true, 
        enum: ['Entrée', 'Plat Principal', 'Dessert', 'Boisson', 'Apéritif'],
        index: true
    },
    isAvailable: { 
        type: Boolean, 
        default: true 
    },
    ingredients: {
        type: [String],
        default: []
    },
    allergens: {
        type: [String],
        default: []
    },
    preparationTime: {
        type: Number, // en minutes
        default: 15
    },
    spicyLevel: {
        type: String,
        enum: ['Doux', 'Moyen', 'Épicé', 'Très Épicé'],
        default: 'Doux'
    }
}, {
    timestamps: true
});

// Schéma principal du Menu
const menuSchema = new mongoose.Schema({
    restaurantId: { 
        type: Number, 
        required: true, 
        index: true
    },
    restaurantName: {
        type: String,
        required: true,
        trim: true
    },
    menuName: {
        type: String,
        required: true,
        trim: true,
        default: 'Menu Principal'
    },
    menuDescription: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    items: [itemSchema],
    
    // Métadonnées
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Index composé pour s'assurer qu'un restaurant n'a qu'un menu actif
menuSchema.index({ restaurantId: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

// Méthode statique pour trouver le menu d'un restaurant
menuSchema.statics.findByRestaurantId = function(restaurantId) {
    return this.findOne({ restaurantId, isActive: true });
};

// Méthode statique pour trouver tous les menus d'un restaurant (historique)
menuSchema.statics.findAllByRestaurantId = function(restaurantId) {
    return this.find({ restaurantId }).sort({ version: -1 });
};

// Méthode pour désactiver l'ancien menu avant d'en créer un nouveau
menuSchema.statics.deactivateMenu = function(restaurantId) {
    return this.updateMany(
        { restaurantId, isActive: true },
        { $set: { isActive: false } }
    );
};

// Méthode d'instance pour ajouter un item
menuSchema.methods.addItem = function(itemData) {
    this.items.push(itemData);
    this.lastUpdated = new Date();
    return this.save();
};

// Méthode d'instance pour supprimer un item
menuSchema.methods.removeItem = function(itemId) {
    this.items.id(itemId).remove();
    this.lastUpdated = new Date();
    return this.save();
};

// Méthode d'instance pour mettre à jour un item
menuSchema.methods.updateItem = function(itemId, updateData) {
    const item = this.items.id(itemId);
    if (item) {
        Object.assign(item, updateData);
        this.lastUpdated = new Date();
    }
    return this.save();
};

// Middleware pour incrémenter la version avant de sauvegarder un nouveau menu actif
menuSchema.pre('save', function(next) {
    if (this.isActive && this.isNew) {
        // Trouver la dernière version et incrémenter
        this.constructor.findOne({ restaurantId: this.restaurantId })
            .sort({ version: -1 })
            .then(lastMenu => {
                this.version = lastMenu ? lastMenu.version + 1 : 1;
                next();
            })
            .catch(next);
    } else {
        next();
    }
});

const MenuModel = mongoose.model('Menu', menuSchema);
module.exports = MenuModel;