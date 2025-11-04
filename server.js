import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors";
import { getWeather } from "./tools/weather.js";
import { getNews } from "./tools/news.js";
import { askAI } from "./tools/ai.js"; // optional
import dotenv from "dotenv";

const app = express();
dotenv.config();
const allowedOrigins = [
  "http://localhost:5173",
  "https://mcp-ui-nine.vercel.app", // ✅ your Vercel frontend
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(bodyParser.json());

// --- Available MCP tools ---
const tools = {
  getWeather,
  getNews,
  askAI,
};

// // --- Root MCP endpoint ---
app.post("/mcp", async (req, res) => {
  const { method, params, id } = req.body;

  if (method === "tool.list") {
    res.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: Object.keys(tools).map((toolId) => ({
          toolId,
          description: `Tool for ${toolId}`,
        })),
      },
    });
  } else if (method === "tool.invoke") {
    const { toolId, input } = params;
    if (!tools[toolId]) {
      return res.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: "Tool not found" },
      });
    }

    try {
      const result = await tools[toolId](input);
      res.json({ jsonrpc: "2.0", id, result });
    } catch (err) {
      res.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32603, message: err.message },
      });
    }
  } else {
    res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: "Unknown method" },
    });
  }
});

app.listen(3000, () => console.log("✅ MCP server running on port 3000"));
