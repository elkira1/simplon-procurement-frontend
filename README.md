# Simplon Services – Frontend

Interface React/Vite pour la plateforme de gestion des demandes d'achats de Simplon Côte d'Ivoire.  
Elle s'appuie sur l'API Django (`back/`) et propose un workflow multi-rôles : Employé → Moyens Généraux → Comptabilité → Direction.

## Fonctionnalités clés

- Authentification sécurisée via cookies HttpOnly (SimpleJWT) + gestion de refresh automatique.
- Tableau de bord dynamique et alertes contextualisées selon le rôle connecté.
- Création, suivi, validation et rejet des demandes avec pièces jointes et timeline.
- Supervision des utilisateurs (création, activation, rôles) et statistiques exportables (Excel).
- Parcours complet de réinitialisation de mot de passe (code OTP + token).

## Prérequis

- Node.js ≥ 18
- npm ≥ 9
- Backend démarré (Django 5) accessible via `VITE_API_BASE_URL`

## Variables d'environnement

Créer un fichier `.env` à la racine du dossier `front/` :

```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Simplon Services
VITE_BRAND_PRIMARY=#e63462
```

> En production, la variable `VITE_API_BASE_URL` peut être omise : le client utilisera automatiquement `/api` sur le même domaine.

## Scripts

| Commande            | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm install`       | Installe les dépendances                      |
| `npm run dev`       | Lance Vite avec HMR sur `http://127.0.0.1:5173` |
| `npm run build`     | Build production (sortie dans `dist/`)        |
| `npm run preview`   | Prévisualise le build à des fins de QA        |
| `npm run lint`      | Vérifie les règles ESLint                     |

## Convention & structure

- `src/context/` pour l'authentification et les hooks partagés
- `src/components/` organisés par domaine (auth, requests, statistics…)
- `src/services/api.jsx` centralise tous les appels HTTP (axios)
- `src/utils/` contient les helpers de formatage, statut, calculs

## Intégration avec le backend

L'API Django expose les endpoints requis sur `/api`.  
Pendant le développement, lancez simultanément :

```bash
# Terminal 1
cd back && source venv/bin/activate && python manage.py runserver

# Terminal 2
cd front && npm run dev
```

## Déploiement

1. `npm run build`
2. Déployer le contenu de `front/dist` derrière un CDN (Vercel, Netlify…) avec un rewrite `/* -> /index.html`.
3. S'assurer que le backend publie `/api` sur le même domaine ou exposer `VITE_API_BASE_URL`.

## Support & contribution

- Respecter l'organisation des composants et les hooks existants.
- Ajouter des tests unitaires/capture d'écran pour les changements UI significatifs.
- Documenter chaque nouvelle variable d'environnement ou dépendance côté `README`.
