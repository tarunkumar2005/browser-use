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
    console.log("Taking screenshot of", { session_id, page_id, full_page, max_width, quality });
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

    console.log("Screenshot taken, size after compression:", compressedBuffer.length);
    
    return compressedBuffer.toString("base64")
  },
});

export const queryElements = tool({
  name: "Query Elements",
  description: "Finds elements by CSS or text and returns attributes + bounding boxes.",
  parameters: z.object({
    session_id: z.string(),
    page_id: z.string(),
    selector: z.string().optional().nullable(),
    text: z.string().optional().nullable(),
  }),
  async execute({ session_id, page_id, selector, text }) {
    const page = getPage(session_id, page_id);
    if (!page) return `error: unknown page ${page_id}`;

    if (selector) {
      const elements = await page.$$eval(selector, els =>
        els.map(el => ({
          tag: el.tagName,
          text: (el as HTMLElement).innerText || '',
          attrs: Array.from(el.attributes).map(a => ({ name: a.name, value: a.value })),
          bbox: el.getBoundingClientRect(),
        }))
      );
      return elements;
    }

    if (text) {
      const elements = await page.$$eval("*", els =>
        els.filter(el => (el as HTMLElement).innerText?.includes(text)).map(el => ({
          tag: el.tagName,
          text: (el as HTMLElement).innerText || '',
          attrs: Array.from(el.attributes).map(a => ({ name: a.name, value: a.value })),
          bbox: el.getBoundingClientRect(),
        }))
      );
      return elements;
    }

    return "error: no selector or text provided";
  },
});

export const fillInput = tool({
  name: "Fill Input",
  description: "Fill a form input identified by selector.",
  parameters: z.object({
    session_id: z.string(),
    page_id: z.string(),
    selector: z.string(),
    value: z.string(),
  }),
  async execute({ session_id, page_id, selector, value }) {
    const page = getPage(session_id, page_id);
    if (!page) return `error: unknown page ${page_id}`;
    await page.fill(selector, value);
    return "ok";
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

export const clickElement = tool({
  name: "Click Element",
  description: "Clicks an element using a CSS selector.",
  parameters: z.object({
    session_id: z.string(),
    page_id: z.string(),
    selector: z.string(),
  }),
  async execute({ session_id, page_id, selector }) {
    const page = getPage(session_id, page_id);
    if (!page) return `error: unknown page ${page_id}`;
    await page.click(selector);
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
    await page.evaluate((y) => window.scrollTo(0, y), y);
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