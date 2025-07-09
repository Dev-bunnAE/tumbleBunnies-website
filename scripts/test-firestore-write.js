const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testWrite() {
  try {
    console.log('Testing write to orders collection...');
    
    const testOrder = {
      parentName: 'Test User',
      parentEmail: 'test@example.com',
      totalAmount: 99.99,
      status: 'paid',
      createdAt: Date.now(),
      items: [
        {
          classId: 'test-class',
          childName: 'Test Child',
          sessionLength: 5,
          price: 99.99
        }
      ]
    };
    
    const docRef = await db.collection('orders').add(testOrder);
    console.log('Successfully wrote test order with ID:', docRef.id);
    
    // Clean up - delete the test order
    await docRef.delete();
    console.log('Test order deleted successfully');
    
  } catch (error) {
    console.error('Error testing write:', error);
  }
}

testWrite().then(() => {
  process.exit(0);
}); 