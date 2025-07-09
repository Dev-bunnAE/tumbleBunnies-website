// Script to seed Firestore with pre-generated classes (CommonJS)
const admin = require('firebase-admin');
const path = require('path');
const { classes } = require(path.join(__dirname, '../src/lib/classes'));

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'tumblebunnies-website',
});

const db = admin.firestore();

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