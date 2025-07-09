const { getFirestore } = require('firebase-admin/firestore');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

initializeApp({ credential: applicationDefault() });

(async () => {
  const db = getFirestore();
  const regs = await db.collection('registrations').get();
  for (const doc of regs.docs) {
    const data = doc.data();
    if (
      data.userId &&
      (!data.parentEmail || !data.parentEmail.endsWith('@tumblebunnies.com'))
    ) {
      await db.collection('registrations').doc(doc.id).delete();
      try {
        await getAuth().deleteUser(data.userId);
        console.log('Deleted', data.parentEmail || data.userId);
      } catch (e) {
        console.error('Failed to delete user', data.userId, e.message);
      }
    }
  }
  console.log('Purge complete.');
})(); 