const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkOrders() {
  try {
    console.log('Checking orders in Firestore...');
    const snapshot = await db.collection('orders').get();
    
    if (snapshot.empty) {
      console.log('No orders found in Firestore.');
      return;
    }
    
    console.log(`Found ${snapshot.size} orders:`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Order ID: ${doc.id}`);
      console.log(`Parent: ${data.parentName}`);
      console.log(`Email: ${data.parentEmail}`);
      console.log(`Total: $${data.totalAmount}`);
      console.log(`Status: ${data.status}`);
      console.log(`Created: ${new Date(data.createdAt).toLocaleString()}`);
      console.log(`Items: ${data.items.length}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error checking orders:', error);
  }
}

checkOrders().then(() => {
  process.exit(0);
}); 