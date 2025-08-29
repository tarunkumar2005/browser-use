import { Agent } from "@openai/agents";
import { SYSTEM_PROMPT } from "./prompt";
import { launchBrowser, openPage } from "./tools/browserTools";
import {
  takeScreenshot,
  changePage,
  clickAtCoordinates,
  doubleClick,
  scrollTo,
  sendKeys,
} from "./tools/playwrightTools";

export const websiteAutomationAgent = new Agent({
  name: "Browser Automation Agent",
  instructions: SYSTEM_PROMPT,
  // model: "openai/gpt-4o",
  model: 'gemini-2.5-flash',
  modelSettings: { 
    maxTokens: 8192,
    temperature: 0.1
  },
  tools: [
    launchBrowser,
    openPage,
    takeScreenshot,
    changePage,
    clickAtCoordinates,
    doubleClick,
    scrollTo,
    sendKeys,
  ],
});