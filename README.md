# THE SEVEN ENGINEER - Centre de Formation et Bureau d'Étude

## 🎓 À propos

THE SEVEN ENGINEER est un centre de formation à but non lucratif situé à Ngaoundéré, Cameroun. Nous offrons des formations pratiques en sciences de l'ingénieur, des services d'ingénierie et du matériel technique de qualité.

## 🚀 Fonctionnalités

### Frontend (React + TypeScript)
- **Interface moderne** avec Tailwind CSS
- **Système d'authentification** complet
- **Catalogue de formations** avec 10 pôles spécialisés
- **Boutique en ligne** pour matériel et équipements
- **Panier et commandes** avec gestion complète
- **Tableau de bord utilisateur** avec suivi des progrès
- **Interface d'administration** pour la gestion
- **Système de messagerie** en temps réel
- **Responsive design** pour tous les appareils

### Backend (Node.js + Express + SQLite)
- **API REST complète** avec authentification JWT
- **Base de données SQLite** avec relations complètes
- **Gestion des utilisateurs** et rôles (admin/user)
- **Système de formations** avec leçons et progression
- **Gestion des produits** et stock
- **Panier et commandes** avec traitement automatique
- **Messagerie** entre utilisateurs et administrateurs
- **Sécurité** avec hashage des mots de passe
- **Validation** des données et gestion d'erreurs

## 🛠️ Technologies utilisées

### Frontend
- React 18 avec TypeScript
- Tailwind CSS pour le design
- React Router pour la navigation
- Context API pour la gestion d'état
- Lucide React pour les icônes

### Backend
- Node.js avec Express
- SQLite pour la base de données
- JWT pour l'authentification
- bcryptjs pour le hashage des mots de passe
- CORS pour les requêtes cross-origin
- Multer pour l'upload de fichiers

## 📦 Installation et démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation
```bash
# Installer les dépendances
npm install

# Créer le fichier .env (déjà configuré)
# Les variables d'environnement sont dans .env
```

### Démarrage

#### Option 1: Démarrage complet (Frontend + Backend)
```bash
npm run dev:full
```

#### Option 2: Démarrage séparé
```bash
# Terminal 1 - Frontend (port 5173)
npm run dev

# Terminal 2 - Backend (port 3001)
npm run dev:server
```

### Accès à l'application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 👥 Comptes de test

### Administrateur
- **Email**: admin@example.com
- **Mot de passe**: admin

### Utilisateur
- **Email**: user@example.com
- **Mot de passe**: user

## 📚 Structure du projet

```
├── src/                          # Frontend React
│   ├── components/              # Composants réutilisables
│   ├── contexts/               # Contexts React (Auth, Cart, etc.)
│   ├── pages/                  # Pages de l'application
│   ├── services/               # Services API
│   └── ...
├── server/                      # Backend Node.js
│   ├── database/               # Configuration base de données
│   ├── middleware/             # Middlewares Express
│   ├── routes/                 # Routes API
│   └── uploads/                # Fichiers uploadés
├── .env                        # Variables d'environnement
└── package.json               # Dépendances et scripts
```

## 🔧 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour profil

### Formations
- `GET /api/courses` - Liste des formations
- `GET /api/courses/:id` - Détails d'une formation
- `POST /api/courses/:id/enroll` - S'inscrire à une formation
- `POST /api/courses/:courseId/lessons/:lessonId/complete` - Marquer une leçon terminée

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit

### Panier
- `GET /api/cart` - Contenu du panier
- `POST /api/cart/add` - Ajouter au panier
- `PUT /api/cart/update` - Modifier quantité
- `DELETE /api/cart/remove` - Supprimer du panier
- `DELETE /api/cart/clear` - Vider le panier

### Commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders/my-orders` - Mes commandes
- `GET /api/orders/:id` - Détails d'une commande

### Messages
- `GET /api/messages` - Mes messages
- `POST /api/messages` - Envoyer un message
- `PATCH /api/messages/:id/read` - Marquer comme lu
- `GET /api/messages/unread-count` - Nombre de messages non lus

## 🎯 Fonctionnalités principales

### Pour les étudiants
- Parcourir et s'inscrire aux formations
- Suivre les cours avec vidéos et leçons
- Tracker sa progression
- Acheter du matériel technique
- Communiquer avec les formateurs

### Pour les administrateurs
- Gérer les formations et leçons
- Gérer les produits et stock
- Suivre les commandes
- Gérer les utilisateurs
- Répondre aux messages

## 🔒 Sécurité

- Authentification JWT avec expiration
- Hashage des mots de passe avec bcrypt
- Validation des données côté serveur
- Protection CORS configurée
- Middleware d'authentification pour les routes protégées
- Séparation des rôles admin/utilisateur

## 📱 Responsive Design

L'application est entièrement responsive et s'adapte à tous les types d'écrans :
- Mobile (320px+)
- Tablette (768px+)
- Desktop (1024px+)
- Large screens (1280px+)

## 🌟 Fonctionnalités avancées

- **Système de progression** pour les formations
- **Gestion automatique du stock** lors des commandes
- **Inscriptions automatiques** aux cours lors de l'achat
- **Messagerie en temps réel** avec réponses automatiques
- **Interface d'administration** complète
- **Système de panier** persistant
- **Génération de factures** avec détails complets

## 🤝 Contribution

Ce projet est développé pour THE SEVEN ENGINEER. Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Contact

**THE SEVEN ENGINEER**
- Adresse: Ngaoundéré 3ème, Bini - Mini-cité la Marseillaise
- Téléphone: +237 674 13 66 97
- Email: contact@the7e.com

---

*"La qualité au service de tous"* - THE SEVEN ENGINEER