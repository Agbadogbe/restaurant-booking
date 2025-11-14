# 🍽️ Restaurant Booking API

Une API REST complète de réservation de restaurants développée avec **Express.js**, **PostgreSQL** et **MongoDB**, mettant en œuvre les meilleures pratiques de sécurité et d'architecture.

## 🚀 Fonctionnalités

### 🔐 Authentification & Sécurité
- **Inscription/Connexion** avec JWT
- **Rôles utilisateurs** (Client, Admin)
- **Refresh Token** automatique
- **Rate Limiting** intelligent
- **Hashage bcrypt** des mots de passe
- **Validation des données** avec Joi

### 🏪 Gestion des Restaurants
- CRUD complet des restaurants
- Recherche par nom et filtrage par capacité
- Gestion des capacités et disponibilités
- Accès administrateur sécurisé

### 📅 Système de Réservation
- Réservation avec vérification de disponibilité
- Annulation intelligente (2h minimum avant)
- Gestion des statuts (confirmée, en attente, annulée, terminée)
- Historique des réservations utilisateur

### 📊 Architecture des Données
- **PostgreSQL** : Données structurées (utilisateurs, restaurants, réservations)
- **MongoDB** : Données non-structurées (menus, logs, statistiques)

## 🛠️ Technologies Utilisées

| Couche | Technologies |
|--------|--------------|
| **Backend** | Express.js 5.1, Node.js |
| **Base de données** | PostgreSQL, MongoDB, Mongoose |
| **Sécurité** | JWT, bcrypt, CORS, Rate Limiting |
| **Validation** | Joi |
| **Documentation** | Swagger/OpenAPI 3.0 |
| **Tests** | Mocha, Chai, Supertest |
| **Développement** | Nodemon, dotenv |

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 12+
- MongoDB Atlas ou local

## ⚡ Installation Rapide

### 1. Cloner le projet
```bash
git clone https://github.com/Agbadogbe/restaurant-booking.git
cd restaurant-booking
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
Créez un fichier `.env` à la racine :

```env
# Server
NODE_ENV=development
PORT=3000

# PostgreSQL
PGUSER=postgres
PGHOST=localhost
PGDATABASE=restaurant_db
PGPASSWORD=votre_mot_de_passe
PGPORT=5432

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant_logs_db

# JWT
JWT_SECRET=votre_super_secret_jwt
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=votre_refresh_secret
JWT_REFRESH_EXPIRATION=7d

# Rate Limiting
AUTH_RATE_LIMIT=5
API_RATE_LIMIT=100
```

### 4. Initialisation de la base de données
L'application crée automatiquement :
- La base de données PostgreSQL si elle n'existe pas
- Les tables nécessaires avec les contraintes
- Les index pour les performances

### 5. Démarrer l'application
```bash
# Développement
npm run dev

# Production
npm start
```

## 📚 Documentation API

### Accéder à la documentation
Une fois l'application démarrée, accédez à :
```
http://localhost:3000/api-docs
```

### 🔑 Authentification

#### S'inscrire
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "nom": "John Doe"
}
```

#### Se connecter
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Utiliser l'API
1. Connectez-vous pour obtenir un token
2. Cliquez sur le bouton "Authorize" en haut de la documentation Swagger
3. Entrez : `Bearer votre_token_jwt`

### 🏪 Endpoints Restaurants

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | `/api/restaurants` | Lister tous les restaurants | Authentifié |
| GET | `/api/restaurants/{id}` | Détails d'un restaurant | Authentifié |
| POST | `/api/restaurants` | Créer un restaurant | Admin |
| PUT | `/api/restaurants/{id}` | Modifier un restaurant | Admin |
| DELETE | `/api/restaurants/{id}` | Supprimer un restaurant | Admin |

### 📅 Endpoints Réservations

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| POST | `/api/reservations` | Créer une réservation | Client |
| GET | `/api/reservations/my-reservations` | Mes réservations | Client |
| PATCH | `/api/reservations/{id}/cancel` | Annuler une réservation | Client/Admin |
| GET | `/api/reservations/availability/{id}` | Vérifier disponibilité | Authentifié |

## 🗃️ Structure de la Base de Données

### PostgreSQL (Données Structurées)
```sql
-- Utilisateurs
users (id_user, email, password_hash, nom, role, refresh_token)

-- Restaurants  
restaurants (id_restaurant, nom, adresse, description, capacite_max)

-- Réservations
reservations (id_reservation, id_user, id_restaurant, date_reservation, nombre_personnes, statut)
```

### MongoDB (Données Non-Structurées)
- **Menus** : Cartes des restaurants avec items et prix
- **ActivityLogs** : Logs d'activité des utilisateurs
- **DailyStats** : Statistiques quotidiennes

## 🔒 Sécurité

### Mesures Implémentées
- ✅ **JWT** avec expiration courte (15min) + refresh
- ✅ **bcrypt** pour le hashage des mots de passe
- ✅ **Rate Limiting** différencié (auth: 5 req/10min, api: 100 req/15min)
- ✅ **CORS** configuré pour les origines autorisées
- ✅ **Validation** stricte des données d'entrée
- ✅ **Gestion centralisée** des erreurs
- ✅ **Protection CSRF** implicite via JWT

### Rôles et Permissions
- **Client** : Réservations, consultation restaurants
- **Admin** : Gestion complète des restaurants et utilisateurs

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec watch mode
npm run test:watch
```

Les tests couvrent :
- ✅ Authentification (register, login, refresh token)
- ✅ Gestion des restaurants (CRUD)
- ✅ Système de réservation
- ✅ Gestion des erreurs

## 🏗️ Architecture du Projet

```
src/
├── config/           # Swagger
├── controllers/      # Logique métier
├── middlewares/      # Auth, validation, rate limiting
├── models/          # Modèles de données
├── routes/          # Définition des routes
├── schemas/         # Validation Joi
├── services/        # Logique métier
└── utils/           # Utilitaires (auth, etc.)
```

## 📊 Statut de l'API

L'API retourne des réponses standardisées :

```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... }
}
```

**Codes HTTP utilisés :**
- 200 : Succès
- 201 : Création réussie
- 400 : Erreur de validation
- 401 : Non authentifié
- 403 : Non autorisé
- 404 : Ressource non trouvée
- 409 : Conflit (doublon)
- 429 : Trop de requêtes
- 500 : Erreur serveur


## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- **Votre Nom** - _Développement initial_ - [kakpo imhotep](https://github.com/Agbadogbe)
- **Votre Nom** - _Développement initial_ - [ADJAHO Mabrouk](https://github.com)


## 🙏 Remerciements 

- EFREI Paris pour le sujet de TP
- La communauté Express.js et MongoDB
- Tous les contributeurs des packages open source utilisés

---

**Objectif du projet** : Concevoir et implémenter une API REST sécurisée utilisant Node.js, Express et MongoDB, en respectant les exigences de sécurité strictes du TP (JWT, bcrypt, CORS, Rate Limiting).

-----

## 📝 Thématique et Ressources

**Thématique** : Recettes de Cuisine.

| Ressource | Rôle | CRUD | Relation | Protection |
| :--- | :--- | :--- | :--- | :--- |
| **User** | Authentification / Auteur | Non (géré par `/auth`) | - | - |
| **Recipe** | Ressource principale (Recette) | CRUD complet (GET, POST, PATCH, DELETE) | Référence à `User` (Auteur) | CRUD Protégé (POST/PATCH/DELETE) |
| **Comment** | Contenu utilisateur | CRUD complet | Références à `User` et `Recipe` | CRUD Protégé (POST/PATCH/DELETE) |

-----

## ⚙️ Technologies Utilisées

  * **Langage/Runtime** : Node.js / JavaScript (ES Modules)
  * **Framework** : Express
  * **Base de Données** : MongoDB
  * **ORM** : Mongoose
  * **Sécurité** : JWT, bcrypt, CORS, Helmet, Rate Limiting, express-validator.

-----

## 🚀 Installation et Démarrage

### Prérequis

  * Node.js (\>= 18)
  * MongoDB en cours d'exécution

### Étapes

1.  **Cloner le dépôt et installer les dépendances :**

    ```bash
    git clone https://github.com/Agbadogbe/restaurant-booking.git
    cd my-secure-api
    npm install
    ```

2.  **Configuration des variables d'environnement (.env) :**
    Créez un fichier `.env` à la racine du projet, en vous basant sur `.env.example`.
    *Assurez-vous que `MONGO_URI` et `JWT_SECRET` sont bien renseignés.*

3.  **Démarrage du serveur en mode développement :**

    ```bash
    npm run dev
    ```

    Le serveur sera accessible sur `http://localhost:3000`.

-----

## 🛣️ Endpoints Principaux (API REST)

Tous les endpoints sont préfixés par `/api`.

| Catégorie | Méthode | Endpoint | Description | Protection |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Création de compte (Hash bcrypt) | Public |
| **Auth** | `POST` | `/auth/login` | Connexion (Retourne le token JWT) | Public (Rate Limité) |
| **Recettes** | `GET` | `/recipes` | Liste (supporte `?page=1&limit=10` pour la pagination) | Public |
| **Recettes** | `POST` | `/recipes` | Créer une recette | Authentifié (JWT) |
| **Recettes** | `DELETE` | `/recipes/:id` | Supprimer une recette | Authentifié (Auteur ou Admin) |
| **Commentaires** | `POST` | `/recipes/:recipeId/comments` | Ajouter un commentaire à une recette | Authentifié (JWT) |
| **Commentaires** | `DELETE` | `/comments/:commentId` | Supprimer un commentaire | Authentifié (Auteur ou Admin) |