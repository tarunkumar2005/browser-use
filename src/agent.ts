import { Agent } from "@openai/agents";
import { SYSTEM_PROMPT } from "./prompt";
import { launchBrowser, openPage } from "./tools/browserTools";
import {
  takeScreenshot,
  changePage,
  fillInput,
  queryElements,
  clickElement,
  doubleClick,
  scrollTo,
  sendKeys,
} from "./tools/playwrightTools";

export const websiteAutomationAgent = new Agent({
  name: "Browser Automation Agent",
  instructions: SYSTEM_PROMPT,
  model: "gemini-2.5-flash-lite",
  modelSettings: {
    temperature: 0.1,
    toolChoice: 'required'
  },
  tools: [
    launchBrowser,
    openPage,
    takeScreenshot,
    changePage,
    fillInput,
    queryElements,
    clickElement,
    doubleClick,
    scrollTo,
    sendKeys,
  ],
});