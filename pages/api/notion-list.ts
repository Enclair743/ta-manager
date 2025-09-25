
import { Client } from "@notionhq/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../src/firebase/firebaseConfig";
import { collection, setDoc, doc } from "firebase/firestore";

const notion = new Client({ auth: process.env.NOTION_TOKEN as string });
const databaseId = process.env.NOTION_DATA_SOURCE_ID as string;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Ambil semua data dari Notion dengan endpoint data source (versi terbaru)
    const notionRes = await fetch(`https://api.notion.com/v1/dataSources/${databaseId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2025-09-03",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter_properties: ["Nama", "User", "Tanggal", "Link"]
      })
    });
    if (!notionRes.ok) {
      const error = await notionRes.json();
      throw new Error(error.message || "Notion API error");
    }
    const response = await notionRes.json();
    // Mapping data ke format JSON
    let pages = response.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        title: props["Nama"]?.title?.[0]?.plain_text || "",
        user: props["User"]?.rich_text?.[0]?.plain_text || "",
        tanggal: props["Tanggal"]?.date?.start || "",
        url: props["Link"]?.url || ""
      };
    });

    // Simpan semua data ke Firestore (koleksi 'notionPages')
    const batchPromises = pages.map(async (page: any) => {
      // Set dokumen dengan id unik (id dari Notion)
      await setDoc(doc(collection(db, "notionPages"), page.id), page);
    });
    await Promise.all(batchPromises);

    res.status(200).json({ message: "Data berhasil disimpan ke Firebase", count: pages.length });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
