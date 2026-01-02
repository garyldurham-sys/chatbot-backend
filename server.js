// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";
import * as cheerio from "cheerio";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve widget.js
app.use(express.static(__dirname));


// ✅ CORS setup for Express 4
// Handle preflight OPTIONS requests
const corsOptions = {
  origin: [
    "https://garydrealestatephotography.com",
    "https://www.garydrealestatephotography.com"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));



app.use(express.json());

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Nodemailer transporter (example using Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,     // your email
    pass: process.env.EMAIL_PASS      // app password if Gmail
  }
});

// In-memory site cache
let siteContentCache = "";

// Scrape endpoint
async function scrapeWebsite(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    $("script, style, [style*='display:none']").remove();
    siteContentCache = $("body").text().replace(/\s+/g, " ").trim();
    console.log("✅ Site content cache updated.");
  } catch (err) {
    console.error("❌ Error scraping site:", err);
  }
}

app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  await scrapeWebsite(url);
  res.json({ message: "Site content cache updated." });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Message is required" });

  try {
    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
You are a helpful assistant for the website you are embedded on.
Use only the website content to answer questions about services, pricing, products, or policies.
Do not ask the user for clarification.
Website content: ${siteContentCache}
`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({ reply: completion.output_text });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});


// ✅ Lead capture endpoint
app.post("/lead", async (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) {
    return res.status(400).json({ success: false, message: "Email or phone is required" });
  }

  // Send email notification
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.LEAD_RECEIVER, // your email or CRM integration
      subject: "New Lead from Chat Widget",
      text: `Email: ${email || "N/A"}\nPhone: ${phone || "N/A"}`
    });

    console.log("📥 Lead received:", req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Could not save lead:", err);
    res.status(500).json({ success: false, message: "Could not save info. Try again." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



