import { NextApiRequest, NextApiResponse } from "next";

// You need to set your Notion integration token here
const NOTION_TOKEN = process.env.NOTION_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { pageId } = req.body;
  if (!pageId) {
    return res.status(400).json({ error: "Missing pageId" });
  }

  try {
    const notionRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ archived: true })
    });
    if (!notionRes.ok) {
      const error = await notionRes.json();
      return res.status(notionRes.status).json({ error });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to archive page" });
  }
}
