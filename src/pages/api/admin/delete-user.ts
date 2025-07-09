import * as admin from 'firebase-admin';
import type { NextApiRequest, NextApiResponse } from 'next';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { uid } = req.body;
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid UID' });
  }
  try {
    await admin.auth().deleteUser(uid);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
} 