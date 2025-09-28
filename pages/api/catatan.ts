import type { NextApiRequest, NextApiResponse } from "next";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../src/firebase/firebaseConfig";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getFirestore(app);
  const snapshot = await getDocs(collection(db, "catatan"));
  const catatan = snapshot.docs.map(doc => doc.data());
  res.status(200).json(catatan);
}
