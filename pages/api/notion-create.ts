import { Client } from "@notionhq/client";
import type { NextApiRequest, NextApiResponse } from "next";

const notion = new Client({ auth: process.env.NOTION_TOKEN as string });
const databaseId = process.env.NOTION_DATA_SOURCE_ID as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { title, userId, tanggal, jenis } = req.body;
  if (!title || !userId) return res.status(400).json({ error: "Missing title or userId" });

  const tanggalValue = tanggal || new Date().toISOString().split("T")[0];
  const jenisValue = typeof jenis === "string" && (jenis === "asistensi" || jenis === "biasa") ? jenis : "asistensi";

  try {
    // Generate temporary Notion page URL (will be updated after creation)
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        "Nama": { title: [{ text: { content: title } }] },
        "User": { rich_text: [{ text: { content: userId } }] },
        "Tanggal": { date: { start: tanggalValue } },
  "Jenis": { rich_text: [{ text: { content: jenisValue } }] },
      }
    });
    // Generate Notion page URL
    const notionUrl = `https://notion.so/${response.id.replace(/-/g, "")}`;
    // Update the page to add the Link property
    await notion.pages.update({
      page_id: response.id,
      properties: {
        "Link": { url: notionUrl }
      }
    });
    res.status(200).json({
  id: response.id,
  url: notionUrl,
  title,
  userId,
  tanggal: tanggalValue,
  jenis: jenisValue
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}