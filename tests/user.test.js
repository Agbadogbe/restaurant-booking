// tests/user.test.js
const { expect } = require('chai');

// --- Données de base pour les utilisateurs ---
const loginClient = { email: '', password: 'Password1' }; // email sera généré dynamiquement
const loginAdmin = { email: '', password: 'Password2' };

let initialAccessToken = '';
let initialRefreshToken = '';
let userId = null;
let adminToken = '';

describe('🚀 Tests d\'Intégration: Authentification Utilisateur', () => {

    // --- Nettoyage complet de la table users avant la suite ---
    before(async () => {
        console.log('🧹 Nettoyage complet de la table "users"...');
        await global.pgPool.query('DELETE FROM users;');
        console.log('✅ Base de données prête.');

        // Génération d'e-mails uniques pour chaque exécution
        loginClient.email = `client_${Date.now()}@yopmail.com`;
        loginAdmin.email = `admin_${Date.now()}@yopmail.com`;

        // --- Création d'un Admin pour les tests suivants ---
        const res = await global.request
            .post('/api/users/register')
            .send({ ...loginAdmin, nom: 'AdminTest' })
            .expect(201);

        // Mise à jour du rôle en base AVANT de sauvegarder le token
        await global.pgPool.query('UPDATE users SET role = $1 WHERE email = $2', ['Admin', loginAdmin.email]);
        console.log('👑 Utilisateur Admin créé et promu.');

        // Reconnexion avec le nouvel Admin pour obtenir un token valide
        const adminLoginRes = await global.request
            .post('/api/users/login')
            .send(loginAdmin)
            .expect(200);

        adminToken = adminLoginRes.body.accessToken;
    });

    // --- Test 1 : Inscription Réussie (Client) ---
    it('doit s\'inscrire, retourner les tokens, et vérifier la DB', async () => {
        const res = await global.request
            .post('/api/users/register')
            .send({ ...loginClient, nom: 'ClientTest' })
            .expect(201);

        // Vérifications de la réponse
        expect(res.body.user).to.include.keys('id', 'email', 'role');
        expect(res.body.accessToken).to.be.a('string').that.is.not.empty;
        expect(res.body.refreshToken).to.be.a('string').that.is.not.empty;
        expect(res.body.user.role).to.equal('Client');

        // Sauvegarde pour les tests suivants
        initialAccessToken = res.body.accessToken;
        initialRefreshToken = res.body.refreshToken;
        userId = res.body.user.id;
        global.accessToken = initialAccessToken;

        console.log(`✅ Client créé : ${res.body.user.email}`);
    });

    // --- Test 2 : Échec de la Validation ---
    it('doit échouer l\'inscription avec un mot de passe non conforme (status 400)', async () => {
        await global.request
            .post('/api/users/register')
            .send({ email: 'mauvais@mdp.com', password: 'court', nom: 'CourtNom' })
            .expect(400);
    });

    // --- Test 3 : Connexion Réussie ---
    it('doit se connecter avec les bonnes informations et retourner de nouveaux tokens', async () => {
        const res = await global.request
            .post('/api/users/login')
            .send(loginClient)
            .expect(200);

        const newAccessToken = res.body.accessToken;
        expect(newAccessToken).to.be.a('string').that.is.not.empty;
        expect(newAccessToken).to.not.equal(initialAccessToken, 'Un NOUVEAU accessToken doit être retourné.');

        global.accessToken = newAccessToken;
        console.log('🔐 Connexion client réussie.');
    });

    // --- Test 4 : Échec de la Connexion (Mot de passe incorrect) ---
    it('doit échouer la connexion avec un mot de passe incorrect (status 401)', async () => {
        // Attendre 1 seconde avant de tenter la connexion pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await global.request
            .post('/api/users/login')
            .send({ email: loginClient.email, password: 'fauxmotdepasse' })
            .expect(401);
    });

    // --- Test 5 : Accès Protégé SANS Token ---
    it('doit refuser l\'accès à une route protégée sans JWT (status 401)', async () => {
        await global.request
            .get('/api/users')
            .expect(401);
    });

    // --- Test 6 : Accès Protégé avec Mauvais Rôle ---
    it('doit refuser l\'accès si le rôle n\'est pas Admin (status 403)', async () => {
        await global.request
            .get('/api/users')
            .set('Authorization', `Bearer ${global.accessToken}`)
            .expect(403);
    });

    // --- Test 7 : Accès Protégé AVEC le Bon Rôle ---
    it('doit autoriser l\'accès si le rôle est Admin (status 200)', async () => {
        const res = await global.request
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(res.body.users).to.be.an('array').that.is.not.empty;
        expect(res.body.users.length).to.be.at.least(2); // ClientTest + AdminTest
        console.log('✅ Accès Admin confirmé.');
    });

    // --- Fermeture du pool après les tests ---
    after(async () => {
        console.log('🧩 Fermeture du pool PostgreSQL...');
        await global.pgPool.end();
        console.log('✅ Pool PostgreSQL fermé.');
    });
});
