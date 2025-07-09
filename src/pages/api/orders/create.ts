import admin from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../../../../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { parentName, parentEmail, totalAmount, items } = req.body;

    // Validate required fields
    if (!parentName || !parentEmail || !totalAmount || !items) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderData = {
      parentName,
      parentEmail,
      totalAmount,
      status: 'paid',
      createdAt: Date.now(),
      items
    };

    const docRef = await db.collection('orders').add(orderData);

    res.status(200).json({ 
      success: true, 
      orderId: docRef.id,
      message: 'Order created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
} 