// Script to seed Firestore with pre-generated classes
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { classes } from '../src/lib/classes';

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
  projectId: 'tumblebunnies-website',
});

const db = getFirestore();

async function seedClasses() {
  const batch = db.batch();
  const classesCol = db.collection('classes');

  for (const cls of classes) {
    const docRef = classesCol.doc();
    batch.set(docRef, {
      name: cls.name,
      ageRange: cls.ageRange,
      imageUrl: cls.imageUrl,
    });
  }

  await batch.commit();
  console.log('Seeded classes to Firestore!');
}

seedClasses().catch(err => {
  console.error('Error seeding classes:', err);
  process.exit(1);
}); 