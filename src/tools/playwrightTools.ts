import { tool } from "@openai/agents";
import { z } from "zod";
import { getPage } from "../store";
import sharp from 'sharp'

export const takeScreenshot = tool({
  name: "Take Screenshot",
  description: "Takes a screenshot of the current webpage.",
  parameters: z.object({
    session_id: z.string(),
    page_id: z.string(),
    full_page: z.boolean().default(true),
    max_width: z.number().default(1024),
    quality: z.number().default(80),
  }).strict(),
  async execute({ session_id, page_id, full_page, max_width, quality }) {
    const page = getPage(session_id, page_id);
    if (!page) return `error: unknown page ${page_id}`;
    
    // Take screenshot as buffer (don't save to file initially)
    const buffer = await page.screenshot({ 
      fullPage: full_page,
      type: 'png'
    });
    
    // Compress and resize the image
    const compressedBuffer = await sharp(buffer)
      .resize({ width: max_width, withoutEnlargement: true })
      .jpeg({ quality }) // Convert to JPEG for better compression
      .toBuffer();
    
    return compressedBuffer.toString("base64")
  },
});

export const changePage = tool({
  name: "Change Page",
  description: "Changes the current page to a new URL.",
  parameters: z.object({
    session_id: z.string(),
    page_id: z.string(),
    url: z.string().describe("Destination URL"),
    wait_until: z.enum(["load","domcontentloaded","networkidle","commit"]).default("domcontentloaded"),
  }).strict(),
  async execute({ session_id, page_id, url, wait_until }) {
    const page = getPage(session_id, page_id);
    if (!page) return `error: unknown page ${page_id}`;
    await page.goto(url, { waitUntil: wait_until });
    return "ok";
  },
});

export const clickAtCoordinates = tool({
  name: "Click At Coordinates",
  description: "Clicks on specific x/y coordinates.",
  parameters: z.object({
    session_id: z.string(),
    page_id: z.string(),
    x: z.number(),
    y: z.number(),
    button: z.enum(["left","right","middle"]).default("left"),
  }).strict(),
  async execute({ session_id, page_id, x, y, button }) {
    const page = getPage(session_id, page_id);
    if (!page) return `error: unknown page ${page_id}`;
    await page.mouse.click(x, y, { button });
    return "ok";
  },
});

export const doubleClick = tool({
  name: "Double Click",
  description: "Double-clicks at specific coordinates.",
  parameters: z.object({
    session_id: z.string(),
    page_id: z.string(),
    x: z.number(),
    y: z.number(),
  }).strict(),
  async execute({ session_id, page_id, x, y }) {
    const page = getPage(session_id, page_id);
    if (!page) return `error: unknown page ${page_id}`;
    await page.mouse.click(x, y, { clickCount: 2 });
    return "ok";
  },
});

export const scrollTo = tool({
  name: "Scroll To",
  description: "Scrolls vertically to y position.",
  parameters: z.object({
    session_id: z.string(),
    page_id: z.string(),
    y: z.number(),
  }).strict(),
  async execute({ session_id, page_id, y }) {
    const page = getPage(session_id, page_id);
    if (!page) return `error: unknown page ${page_id}`;
    await page.mouse.wheel(0, y);
    return "ok";
  },
});

export const sendKeys = tool({
  name: "Send Keys",
  description: "Types keystrokes into the page.",
  parameters: z.object({
    session_id: z.string(),
    page_id: z.string(),
    keys: z.string(),
  }).strict(),
  async execute({ session_id, page_id, keys }) {
    const page = getPage(session_id, page_id);
    if (!page) return `error: unknown page ${page_id}`;
    await page.keyboard.type(keys);
    return "ok";
  },
});