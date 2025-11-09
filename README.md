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

Copiez `.env.example` vers `.env` puis personnalisez les valeurs :

```bash
VITE_API_BASE_URL=http://localhost:8000/api
# Optionnel: fallback production si VITE_API_BASE_URL n'est pas défini (ex: Vercel)
VITE_DEFAULT_PROD_API=https://simplonservices.onrender.com/api
VITE_APP_NAME=Simplon Services
```

Sur Vercel, définis `VITE_API_BASE_URL` (ou à défaut `VITE_DEFAULT_PROD_API`) dans l'onglet **Environment Variables** pour pointer vers l'API Render (`https://simplonservices.onrender.com/api`). Ça évite les soucis CORS et garde la configuration déclarative.

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
