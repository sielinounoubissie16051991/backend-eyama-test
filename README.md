# Backend Eyama - Manuel d'utilisation

## Description

Ce dépôt contient le backend NestJS de l’application Eyama.
Il gère :

- la gestion des objets
- le stockage d’images sur Cloudinary
- une persistance optionnelle sur MongoDB
- une API documentée avec Swagger

## Pré-requis

- Node.js 18+ ou version compatible
- npm
- MongoDB si vous voulez la persistance
- Cloudinary pour l’upload d’images

## Installation du projet

```bash
npm install
```

## Configuration des variables d’environnement

Créez un fichier `.env` à la racine du projet.

Exemple de contenu :

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/eyama
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

### Explication des variables

- `PORT` : port sur lequel le backend écoute
- `MONGODB_URI` : URL de connexion MongoDB
- `FRONTEND_URL` : origine autorisée pour CORS
- `CLOUDINARY_CLOUD_NAME` : nom de ton compte Cloudinary
- `CLOUDINARY_API_KEY` : clé API Cloudinary
- `CLOUDINARY_API_SECRET` : secret API Cloudinary

## Comportement MongoDB

Le backend active MongoDB uniquement si `MONGODB_URI` est défini.

- si `MONGODB_URI` existe : connexion réelle à MongoDB
- si `MONGODB_URI` est absent : l’application utilise un stockage en mémoire

Cela signifie que tu peux tester l’application sans base, mais les données disparaissent au redémarrage.

## Installation et utilisation de MongoDB sur Windows

### 1) Vérifier si MongoDB est installé

```powershell
where mongod
where mongosh
where mongo
```

### 2) Installer MongoDB Server

```powershell
winget install --id MongoDB.Server -e
```

### 3) Installer MongoDB Shell (mongosh)

```powershell
winget install --id MongoDB.Shell -e
```

### 4) Démarrer MongoDB

#### Option A : service Windows

```powershell
Start-Process powershell -Verb runAs
net start MongoDB
```

#### Option B : démarrage manuel

```powershell
mkdir C:\data\db
"C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "C:\data\db"
```

> Remplace `8.3` par la version installée.

### 5) Se connecter à MongoDB

```powershell
mongosh "mongodb://127.0.0.1:27017/eyama"
```

Si `mongosh` n’est pas trouvé, utilise le chemin complet :

```powershell
& "C:\Program Files\MongoDB\Server\8.3\bin\mongosh.exe" "mongodb://127.0.0.1:27017/eyama"
```

### 6) Arrêter MongoDB

Si MongoDB tourne comme service :

```powershell
net stop MongoDB
```

Si tu l’as démarré manuellement :

- ferme la fenêtre du terminal où `mongod` tourne
- ou presse `Ctrl+C`

### 7) Vérifier le port MongoDB

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 27017
```

## Lancement de l’application

### Mode développement

```bash
npm run start:dev
```

### Mode production

```bash
npm run build
npm run start:prod
```

### Vérifier la compilation TypeScript

```bash
npx tsc --noEmit
```

## Documentation Swagger

Une fois l’application démarrée, la documentation est disponible ici :

```text
http://localhost:3001/api
```

## Endpoints disponibles

### Objets

- `GET /objects` : récupère tous les objets
- `POST /objects` : crée un objet avec une image
- `GET /objects/:id` : récupère un objet par son ID
- `DELETE /objects/:id` : supprime un objet

### Cloudinary

- `POST /cloudinary/upload` : upload d’une image
- `DELETE /cloudinary/:publicId` : suppression d’une image Cloudinary

## Exemples d’utilisation

### Créer un objet

```bash
curl -X POST http://localhost:3001/objects \
  -F "title=Mon titre" \
  -F "description=Ma description" \
  -F "image=@/chemin/vers/image.jpg"
```

### Lister les objets

```bash
curl http://localhost:3001/objects
```

### Récupérer un objet

```bash
curl http://localhost:3001/objects/<id>
```

### Supprimer un objet

```bash
curl -X DELETE http://localhost:3001/objects/<id>
```

### Uploader une image Cloudinary

```bash
curl -X POST http://localhost:3001/cloudinary/upload \
  -F "file=@/chemin/vers/image.jpg"
```

### Supprimer une image Cloudinary

```bash
curl -X DELETE http://localhost:3001/cloudinary/<publicId>
```

## Structure du projet

- `src/main.ts` : bootstrap NestJS et configuration de Swagger
- `src/app.module.ts` : configuration globale, module Cloudinary, MongoDB
- `src/objects` : contrôleur, service, DTO, schéma
- `src/cloudinary` : upload et suppression Cloudinary
- `src/events` : WebSocket et émission d’événements

## Conseils de configuration

- Ne pas committer les secrets Cloudinary ou les identifiants MongoDB
- Assurer que `MONGODB_URI` est défini en production
- Utiliser Swagger pour tester les routes
- S’assurer que le port `3001` est libre avant de lancer l’app

## Débogage rapide

- `npm run start:dev`
- `npx tsc --noEmit`
- `curl http://localhost:3001/api`
- `curl http://localhost:3001/objects`

## Licence

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
