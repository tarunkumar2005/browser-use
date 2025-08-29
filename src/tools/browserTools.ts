import { tool } from "@openai/agents";
import { z } from "zod";
import { createSession, getSession, addPage } from "../store";

export const launchBrowser = tool({
  name: "Launch Browser",
  description: "Launch a new browser instance with a fresh context.",
  parameters: z.object({
    headless: z.boolean().default(true).describe("Run browser headlessly"),
  }),
  async execute({ headless }) {
    const session_id = await createSession(headless);
    return `session:${session_id}`;
  },
});

export const openPage = tool({
  name: "Open Page",
  description: "Open a new page in the given session and navigate to the URL.",
  parameters: z.object({
    session_id: z.string().describe("ID returned by launch_browser"),
    url: z.string().describe("Destination URL"),
    wait_until: z.enum(["load","domcontentloaded","networkidle","commit"]).default("domcontentloaded"),
  }),
  async execute({ session_id, url, wait_until }) {
    const session = getSession(session_id);
    if (!session) return `error: unknown session ${session_id}`;
    const page = await session.context.newPage();
    await page.goto(url, { waitUntil: wait_until });
    const page_id = addPage(session_id, page)!;
    return `opened:${page_id}`;
  },
});