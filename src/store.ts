import { createStore } from "zustand/vanilla";
import { chromium, devices } from "playwright";
import type { Browser, BrowserContext, Page } from "playwright";

type Session = {
  browser: Browser;
  context: BrowserContext;
  pages: Map<string, Page>;
  createdAt: Date;
};

type State = {
  sessions: Map<string, Session>;
};

export const store = createStore<State>(() => ({ sessions: new Map() }));

export async function createSession(headless = true) {
  const browser = await chromium.launch({ 
    headless: false, // Always show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({ 
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 720 }
  });
  
  const session_id = crypto.randomUUID();
  const pages = new Map<string, Page>();
  
  store.getState().sessions.set(session_id, { 
    browser, 
    context, 
    pages, 
    createdAt: new Date() 
  });
  
  return session_id;
}

export function getSession(session_id: string) {
  return store.getState().sessions.get(session_id);
}

export function addPage(session_id: string, page: Page) {
  const session = getSession(session_id);
  if (!session) return null;
  
  const page_id = crypto.randomUUID();
  session.pages.set(page_id, page);
  return page_id;
}

export function getPage(session_id: string, page_id: string) {
  const session = getSession(session_id);
  return session?.pages.get(page_id) ?? null;
}

export async function closeSession(session_id: string) {
  const session = getSession(session_id);
  if (session) {
    await session.browser.close();
    store.getState().sessions.delete(session_id);
  }
}

// Auto cleanup old sessions
export function cleanupOldSessions(maxAgeMinutes = 30) {
  const now = new Date();
  const sessions = store.getState().sessions;
  
  for (const [id, session] of sessions) {
    const ageMinutes = (now.getTime() - session.createdAt.getTime()) / (1000 * 60);
    if (ageMinutes > maxAgeMinutes) {
      closeSession(id).catch(console.error);
    }
  }
}