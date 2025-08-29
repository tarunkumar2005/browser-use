import { run, setDefaultOpenAIClient, setOpenAIAPI, setTraceProcessors } from "@openai/agents";
import { createOpenAIClient } from "./openai-provider";
// import { createdeepseekClient } from "./deepseek-provider";
import { websiteAutomationAgent } from "./agent";

setTraceProcessors([])
setDefaultOpenAIClient(createOpenAIClient());
setOpenAIAPI("chat_completions");

const query = process.argv.slice(2).join(" ");

if (!query) {
  console.error("No task provided. Usage: npm start 'Go to google.com and search cats'");
  process.exit(1);
}

(async () => {
  try {
    const result = await run(websiteAutomationAgent, query, {
      stream: true,
    });
    result
      .toTextStream({
        compatibleWithNodeStreams: true,
      })
      .pipe(process.stdout);
  } catch (err) {
    console.error("Error running agent:", err);
  }
})();