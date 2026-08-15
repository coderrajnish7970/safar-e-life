const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Destination = require("./models/Destination");

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL;

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const MIN_STORIES = 5;
const MAX_STORIES = 8;

if (!MONGODB_URI) {
  console.error("❌ MongoDB connection string not found in .env");
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error("❌ Gemini API key not found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
});

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(value) {
  if (!value) return "";

  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .trim();
}

function isKnowledgeComplete(destination) {
  return (
    destination.geography &&
    destination.history &&
    destination.culture &&
    destination.climate &&
    destination.travelInfo
  );
}

function isStoriesComplete(destination) {
  return (
    Array.isArray(destination.destinationStory) &&
    destination.destinationStory.length >= MIN_STORIES
  );
}

/* -------------------------------------------------------
   GEMINI KNOWLEDGE GENERATION
------------------------------------------------------- */

async function generateKnowledge(destination) {
  const prompt = `
You are a professional travel information writer for an Indian travel
application called "सफ़र-ए-Life".

Create accurate, useful and concise destination information for:

Destination: ${destination.name}
State/Region: ${destination.state || "India"}

Return ONLY valid JSON.

Required JSON structure:

{
  "geography": "...",
  "history": "...",
  "culture": "...",
  "climate": "...",
  "travelInfo": "..."
}

Requirements:

- geography: explain location, landscape and important geographical features.
- history: explain important historical background and heritage.
- culture: explain local traditions, festivals, architecture, lifestyle and food.
- climate: explain seasons and the generally preferred travel period.
- travelInfo: explain practical access by air, rail, road and local transport.
- Keep each field approximately 50-100 words.
- Do not invent airports, railway stations or attractions.
- If something is uncertain, keep the statement general.
- Do not include markdown.
- Do not include code fences.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  let jsonText = text;

  if (jsonText.startsWith("```")) {
    jsonText = jsonText
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  return JSON.parse(jsonText);
}

/* -------------------------------------------------------
   WIKIMEDIA COMMONS SEARCH
------------------------------------------------------- */

async function searchCommons(destination, attraction) {
  const query = `${destination} ${attraction}`;

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "1200",
  });

  const url =
    "https://commons.wikimedia.org/w/api.php?" + params.toString();

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "SafarELifeDestinationEnricher/1.0 (travel project)",
    },
  });

  if (!response.ok) {
    throw new Error(`Wikimedia HTTP ${response.status}`);
  }

  const data = await response.json();

  const pages = data.query?.pages
    ? Object.values(data.query.pages)
    : [];

  for (const page of pages) {
    const info = page.imageinfo?.[0];

    if (!info) continue;

    const mime = info.mime || "";

    if (!mime.startsWith("image/")) continue;

    if (
      mime.includes("svg") ||
      mime.includes("gif") ||
      mime.includes("tiff")
    ) {
      continue;
    }

    const metadata = info.extmetadata || {};

    const imageUrl =
      info.thumburl ||
      info.url ||
      "";

    if (!imageUrl) continue;

    const artist =
      cleanText(metadata.Artist?.value) ||
      cleanText(metadata.Credit?.value) ||
      "Wikimedia Commons";

    const license =
      cleanText(metadata.LicenseShortName?.value) ||
      "See Wikimedia Commons source";

    const description =
      cleanText(metadata.ImageDescription?.value) ||
      `${attraction} in ${destination}.`;

    return {
      imageUrl,
      title: attraction,
      description,
      credit: artist,
      sourceUrl:
        `https://commons.wikimedia.org/wiki/${encodeURIComponent(
          page.title.replace(/ /g, "_")
        )}`,
      license,
    };
  }

  return null;
}

/* -------------------------------------------------------
   STORY GENERATION
------------------------------------------------------- */

async function generateStories(destination) {
  const attractions = Array.isArray(destination.topAttractions)
    ? destination.topAttractions
    : [];

  const existingStories = Array.isArray(destination.destinationStory)
    ? destination.destinationStory
    : [];

  const existingUrls = new Set(
    existingStories.map((story) => story.imageUrl)
  );

  const stories = [...existingStories];

  for (const attraction of attractions) {
    if (stories.length >= MAX_STORIES) break;

    try {
      console.log(`      🔎 Searching image: ${attraction}`);

      const image = await searchCommons(
        destination.name,
        attraction
      );

      if (!image) {
        console.log(`      ⚠️ No suitable image found`);
        continue;
      }

      if (existingUrls.has(image.imageUrl)) {
        continue;
      }

      stories.push(image);
      existingUrls.add(image.imageUrl);

      console.log(`      📸 Added: ${attraction}`);

      await sleep(500);
    } catch (error) {
      console.log(
        `      ⚠️ Image search failed: ${error.message}`
      );
    }
  }

  return stories;
}

/* -------------------------------------------------------
   PROCESS ONE DESTINATION
------------------------------------------------------- */

async function processDestination(destination) {
  console.log("");
  console.log("────────────────────────────────────");
  console.log(`🌴 ${destination.name}`);
  console.log("────────────────────────────────────");

  let updateNeeded = false;

  /* KNOWLEDGE */

  if (isKnowledgeComplete(destination)) {
    console.log("   ✅ Knowledge already complete");
  } else {
    console.log("   🤖 Generating destination knowledge...");

    try {
      const knowledge = await generateKnowledge(destination);

      destination.geography =
        destination.geography || knowledge.geography;

      destination.history =
        destination.history || knowledge.history;

      destination.culture =
        destination.culture || knowledge.culture;

      destination.climate =
        destination.climate || knowledge.climate;

      destination.travelInfo =
        destination.travelInfo || knowledge.travelInfo;

      updateNeeded = true;

      console.log("   🌍 Geography ✓");
      console.log("   📜 History ✓");
      console.log("   🎭 Culture ✓");
      console.log("   🌤️ Climate ✓");
      console.log("   ✈️ Travel Info ✓");

      await sleep(1000);
    } catch (error) {
      console.log(
        `   ❌ Knowledge generation failed: ${error.message}`
      );
    }
  }

  /* STORIES */

  if (isStoriesComplete(destination)) {
    console.log(
      `   ✅ ${destination.destinationStory.length} stories already exist`
    );
  } else {
    console.log("   📸 Building visual stories...");

    const stories = await generateStories(destination);

    if (stories.length !== destination.destinationStory.length) {
      destination.destinationStory = stories;
      updateNeeded = true;
    }

    console.log(
      `   📸 Stories available: ${stories.length}`
    );
  }

  /* SAVE */

  if (updateNeeded) {
    await Destination.updateOne(
      { _id: destination._id },
      {
        $set: {
          geography: destination.geography || "",
          history: destination.history || "",
          culture: destination.culture || "",
          climate: destination.climate || "",
          travelInfo: destination.travelInfo || "",
          destinationStory:
            destination.destinationStory || [],
        },
      }
    );

    console.log("   💾 Saved to MongoDB");
  } else {
    console.log("   ⏭️ Nothing to update");
  }
}

/* -------------------------------------------------------
   MAIN
------------------------------------------------------- */

async function main() {
  console.log("");
  console.log("🌴 सफ़र-ए-Life Destination Enrichment");
  console.log("======================================");
  console.log("");

  try {
    await mongoose.connect(MONGODB_URI);

    console.log("✅ Connected to MongoDB");

    const destinations = await Destination.find({}).sort({
      name: 1,
    });

    console.log(
      `📍 Found ${destinations.length} destinations`
    );

    console.log("");

    let completed = 0;
    let failed = 0;

    for (const destination of destinations) {
      try {
        await processDestination(destination);
        completed++;
      } catch (error) {
        failed++;

        console.error(
          `   ❌ ${destination.name} failed: ${error.message}`
        );
      }
    }

    console.log("");
    console.log("======================================");
    console.log("🎉 ENRICHMENT FINISHED");
    console.log("======================================");
    console.log(`📍 Total: ${destinations.length}`);
    console.log(`✅ Processed: ${completed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log("");
  } catch (error) {
    console.error("");
    console.error("❌ ENRICHMENT ERROR");
    console.error(error.message);
    console.error("");
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

main();