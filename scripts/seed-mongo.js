require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eyama';

const seeds = [
  {
    _id: 'seed-1',
    id: 'seed-1',
    title: 'Vase en céramique',
    description: 'Un objet de décoration à exposer dans un salon moderne.',
    imageUrl:
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80',
    imagePublicId: '',
    createdAt: new Date('2026-07-10T09:30:00.000Z'),
  },
  {
    _id: 'seed-2',
    id: 'seed-2',
    title: 'Lampe de bureau',
    description: 'Lampe compacte avec une lumière douce pour les soirées de travail.',
    imageUrl:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    imagePublicId: '',
    createdAt: new Date('2026-07-12T15:45:00.000Z'),
  },
];

async function run() {
  console.log('Connexion à MongoDB...', uri);
  await mongoose.connect(uri);
  const collectionName = 'objectentities';
  const coll = mongoose.connection.collection(collectionName);

  for (const seed of seeds) {
    const res = await coll.updateOne({ _id: seed._id }, { $set: seed }, { upsert: true });
    if (res.upsertedCount > 0) {
      console.log(`Inséré: ${seed._id}`);
    } else if (res.matchedCount > 0) {
      console.log(`Mis à jour: ${seed._id}`);
    } else {
      console.log(`OK: ${seed._id}`);
    }
  }

  await mongoose.disconnect();
  console.log('Terminé.');
}

run().catch((err) => {
  console.error('Erreur:', err);
  process.exit(1);
});
