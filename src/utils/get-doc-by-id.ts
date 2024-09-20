import fs from "node:fs/promises";
import path from "node:path";

export async function getDocById(id: string): Promise<string | null> {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "app",
      "v1",
      id,
      "docs.md",
    );
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error("Error reading Markdown file:", error);
    return null;
  }
}
