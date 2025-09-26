import { Client } from "@notionhq/client";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const notion = new Client({ auth: process.env.NOTION_TOKEN as string });
const databaseId = process.env.NOTION_DATA_SOURCE_ID as string;

async function fetchNotionPages() {
  // 1. Discovery data_source_id
  const dbInfo: any = await notion.databases.retrieve({ database_id: databaseId });
  const dataSourceId = dbInfo.data_sources?.[0]?.id;
  if (!dataSourceId) {
    console.error("Data source ID not found", dbInfo);
    throw new Error("Data source ID not found");
  }

  // Query data source dengan fetch manual
  const notionApiUrl = `https://api.notion.com/v1/data_sources/${dataSourceId}/query`;
  const response = await fetch(notionApiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2025-09-03",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      // filter, sorts, dll bisa ditambahkan di sini jika diperlukan
    })
  });
  const result = await response.json();
  console.log("Notion API response:", JSON.stringify(result, null, 2));
  if (!response.ok) {
    console.error("Notion API error:", result);
    throw new Error(result.message || "Notion API error");
  }
  return (result.results || []).map((item: any) => {
    const props = item.properties || {};
    return {
      id: item.id,
      title: props.Nama?.title?.[0]?.text?.content || "",
      user: props.User?.rich_text?.[0]?.text?.content || "",
      tanggal: props.Tanggal?.date?.start || "",
      url: props.Link?.url || "",
      jenis:
        props.Jenis?.rich_text?.[0]?.text?.content
        ?? (typeof props.Jenis === "string" ? props.Jenis : undefined)
        ?? "asistensi"
    };
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const pages = await fetchNotionPages();
    const filePath = path.join(process.cwd(), "public", "catatan.json");
    fs.writeFileSync(filePath, JSON.stringify({ pages }, null, 2), "utf-8");
    res.status(200).json({ success: true, count: pages.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
