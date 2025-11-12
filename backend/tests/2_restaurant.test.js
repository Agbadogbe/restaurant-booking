// 🍽️ tests/2_restaurant.test.js
const { expect } = require('chai');

const validRestaurant = {
    nom: "La Table de Mocha",
    adresse: "123 Rue des Tests",
    description: "Cuisine gastronomique testée et approuvée.",
    capacite_max: 50
};

let restaurantId = null;

describe('🍴 Tests d\'Intégration: Gestion des Restaurants', () => {

    before(async () => {
        console.log('🧹 Nettoyage de la table "restaurants"...');
        await global.pgPool.query('TRUNCATE TABLE restaurants RESTART IDENTITY CASCADE;');
        
        // Vérifier que les tokens Admin/Client sont disponibles
        if (!global.adminToken) {
            throw new Error('Token Admin non initialisé ! Assurez-vous que user.test.js s\'exécute en premier.');
        }
        if (!global.accessToken) {
            throw new Error('Token Client (accessToken) non initialisé ! Assurez-vous que user.test.js s\'exécute en premier.');
        }
    });

    it('doit refuser la création sans token (401)', async () => {
        await global.request
            .post('/api/restaurants')
            .send(validRestaurant)
            .expect(401);
    });

    it('doit refuser si rôle Client (403)', async () => {
        await global.request
            .post('/api/restaurants')
            .set('Authorization', `Bearer ${global.accessToken}`)
            .send(validRestaurant)
            .expect(403);
    });

    it('doit refuser des données invalides (400)', async () => {
        const invalidData = {
            nom: "Nom valide",
            adresse: "Adresse valide",
            description: "Une description"
            // capacite_max manquante intentionnellement
        };

        const res = await global.request
            .post('/api/restaurants')
            .set('Authorization', `Bearer ${global.adminToken}`)
            .send(invalidData)
            .expect(400);

        expect(res.body).to.have.property('errors');
        expect(res.body.errors).to.be.an('array').that.is.not.empty;
    });

    it('doit créer un restaurant si rôle Admin (201)', async () => {
        const res = await global.request
            .post('/api/restaurants')
            .set('Authorization', `Bearer ${global.adminToken}`)
            .send(validRestaurant)
            .expect(201);

        expect(res.body.restaurant).to.have.property('id_restaurant').that.is.a('number');
        expect(res.body.restaurant.nom).to.equal(validRestaurant.nom);
        restaurantId = res.body.restaurant.id_restaurant;
        console.log('✅ Restaurant créé avec succès.');
    });

    it('Client doit pouvoir voir la liste des restaurants (200)', async () => {
        const res = await global.request
            .get('/api/restaurants')
            .set('Authorization', `Bearer ${global.accessToken}`)
            .expect(200);

        expect(res.body).to.have.property('restaurants');
        expect(res.body.restaurants).to.be.an('array').that.is.not.empty;
        expect(res.body.restaurants[0].id_restaurant).to.equal(restaurantId);
    });

    it('Admin doit aussi pouvoir voir la liste (200)', async () => {
        const res = await global.request
            .get('/api/restaurants')
            .set('Authorization', `Bearer ${global.adminToken}`)
            .expect(200);

        expect(res.body).to.have.property('restaurants');
        expect(res.body.restaurants).to.be.an('array').that.is.not.empty;
    });

    after(async () => {
        await global.pgPool.query('TRUNCATE TABLE restaurants RESTART IDENTITY CASCADE;');
        console.log('🗑️ Nettoyage final de la table "restaurants".');
    });
});