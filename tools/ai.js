import OpenAI from "openai";
import { getWeather } from "./weather.js";
import { getNews } from "./news.js";

const client = new OpenAI({
  apiKey:
    "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",
});

export async function askAI(input) {
  const { question } = input;

  const systemPrompt = `
  You are an intelligent tool orchestrator.
  You have access to:
  1. getWeather(city)
  2. getNews(topic)

  Analyze the user's request and return a JSON array describing which tools to call.
  Example 1:
  User: "What is the weather in Chennai?"
  Response: [{"toolId": "getWeather", "params": {"city": "Chennai"}}]

  Example 2:
  User: "What is the weather in Delhi and latest news in Delhi?"
  Response: [
    {"toolId": "getWeather", "params": {"city": "Delhi"}},
    {"toolId": "getNews", "params": {"topic": "Delhi"}}
  ]

  Output ONLY valid JSON.
  `;

  try {
    // Step 1: Ask OpenAI which tools to invoke
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.2,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);

    // Step 2: Execute all tools sequentially
    const results = {};
    for (const step of parsed) {
      if (step.toolId === "getWeather") {
        const weather = await getWeather(step.params);
        results.weather = weather;
      } else if (step.toolId === "getNews") {
        const news = await getNews(step.params);
        results.news = news;
      }
    }

    // Step 3: Build combined natural language summary
    let summary = "";
    if (results.weather) {
      summary += `🌤️ The weather in ${results.weather.city} is ${results.weather.condition} with ${results.weather.temperature}. `;
    }
    if (results.news && results.news.top?.length > 0) {
      const topTitles = results.news.top
        .slice(0, 3)
        .map((n) => n.title)
        .join("; ");
      summary += `📰 Top news: ${topTitles}`;
    }

    return {
      intent: "multi",
      query: question,
      result: results,
      answer: summary.trim(),
    };
  } catch (err) {
    console.error("askAI error:", err.message);
    return {
      intent: "error",
      query: question,
      answer:
        "Sorry, I couldn’t understand your request. Try asking about weather or news separately.",
    };
  }
}
