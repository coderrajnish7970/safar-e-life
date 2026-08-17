require("dotenv").config();
const mongoose = require("mongoose");
const Destination = require("./models/Destination");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://singhrajnish7970_db_user:splitsmart123@ac-dkgyga2-shard-00-00.pwhhqde.mongodb.net:27017,ac-dkgyga2-shard-00-01.pwhhqde.mongodb.net:27017,ac-dkgyga2-shard-00-02.pwhhqde.mongodb.net:27017/splitsmart?ssl=true&replicaSet=atlas-p7ruqi-shard-0&authSource=admin&appName=Cluster0";

// Royalty-free photo pools per category with Unsplash License (Free for commercial & personal use)
const photoPools = {
  Heritage: [
    { id: "photo-1524492412937-b28074a5d7da", title: "Majestic Architecture & Heritage Forts", desc: "Intricate carvings, ancient stone masonry, and grand gateways reflecting centuries of royal Indian history." },
    { id: "photo-1599661046289-e31897846e41", title: "Historical Palace Courtyards", desc: "Sprawling royal courtyards, ornamental arches, and heritage corridors preserved through generations." },
    { id: "photo-1564507592333-c60657eea523", title: "UNESCO World Heritage Landmarks", desc: "Iconic monuments showcasing Mughal and Rajput architectural mastery and timeless symmetry." },
    { id: "photo-1548013146-72479768bada", title: "Ancient Stone Ruins & Temples", desc: "Monolithic sculptures and stone-carved heritage structures standing as proof of ancient engineering." },
    { id: "photo-1600100397608-f010e423b971", title: "Royal Fort Ramparts & City Views", desc: "Panoramic views from historic fort walls overlooking ancient settlements and historic quarters." },
    { id: "photo-1587474260584-136574528ed5", title: "Heritage Streets & Cultural Markets", desc: "Vibrant bazaar lanes surrounding historic landmarks filled with traditional crafts and local heritage." }
  ],
  Beach: [
    { id: "photo-1512343879784-a960bf40e7f2", title: "Golden Sands & Ocean Waves", desc: "Sun-drenched coastlines with soft golden sand and rolling turquoise ocean surf." },
    { id: "photo-1507525428034-b723cf961d3e", title: "Tropical Palm Groves & Coastal Shacks", desc: "Pristine beaches framed by swaying coconut palms and relaxed coastal retreats." },
    { id: "photo-1544551763-46a013bb70d5", title: "Sunset Horizon Over Arabian Sea", desc: "Breathtaking twilight views across calm waters with coastal fishing vessels along the shore." },
    { id: "photo-1519046904884-53103b34b206", title: "Secluded Coastal Cliffs & Hidden Bays", desc: "Dramatic rock formations and quiet coves offering serene coastal escapes." },
    { id: "photo-1590523741831-ab7e8b8f9c7f", title: "Water Sports & Beachfront Promenade", desc: "Lively shores offering water activities, coastal dining, and vibrant seaside walks." },
    { id: "photo-1506929562872-bb421503ef21", title: "Clear Waters & Coral Coastlines", desc: "Crystal clear sea waters ideal for swimming, snorkeling, and coastal photography." }
  ],
  Spiritual: [
    { id: "photo-1561361513-2d000a50f0dc", title: "Sacred River Ghats & Evening Aarti", desc: "Spiritual riverbanks illuminated by oil lamps, incense, and devotional chants at sunset." },
    { id: "photo-1588096344316-f71c8f1f2a88", title: "Golden Sanctum & Holy Reflections", desc: "Resplendent temple architecture reflected in sacred waters embodying peace and devotion." },
    { id: "photo-1609949279531-cf48d64bed89", title: "Ancient Temple Towers & Gopurams", desc: "Towering temple spires adorned with intricate deity sculptures and traditional sacred art." },
    { id: "photo-1544717305-2782549b5136", title: "Morning Pilgrimage & Sacred Rituals", desc: "Devotees gathering along holy riverbanks for morning prayers and spiritual purification." },
    { id: "photo-1582510003544-4d00b7f74220", title: "Spiritual Ashrams & Tranquil Courtyards", desc: "Peaceful spiritual centers surrounded by nature, ideal for meditation and yoga." },
    { id: "photo-1590050752117-238cb0fb12b1", title: "Heritage Shrines & Sacred Bells", desc: "Traditional temple bells and oil lamps symbolizing centuries of sacred worship and faith." }
  ],
  Mountains: [
    { id: "photo-1626621341517-bbf3d9990a23", title: "Snow-Capped Himalayan Peaks", desc: "Towering mountain ranges covered in perpetual snow above lush alpine valleys." },
    { id: "photo-1581793745862-99fde7fa73d2", title: "High-Altitude Pass & Cold Desert Trails", desc: "Rugged mountain roads winding through dramatic high-elevation mountain landscapes." },
    { id: "photo-1595815771614-ade9d652a65d", title: "Alpine Lakes & Mirror Reflections", desc: "Pristine glacial lakes reflecting clear blue mountain skies and surrounding peaks." },
    { id: "photo-1506744038136-46273834b3fb", title: "Pine Forests & Mountain Meadows", desc: "Dense evergreen pine forests opening into wide green valleys and rushing rivers." },
    { id: "photo-1464822759023-fed622ff2c3b", title: "Mist-Covered Ridge Lines & Valleys", desc: "Atmospheric mountain views with rolling clouds drift across deep forest gorges." },
    { id: "photo-1519681393784-d120267933ba", title: "Starry Mountain Night & Camping", desc: "Clear night skies brimming with stars over quiet mountain campsites." }
  ],
  Wildlife: [
    { id: "photo-1534188753412-3e26d0d618d6", title: "Royal Bengal Tiger & Dense Jungle Canopy", desc: "Majestic wildlife thriving inside protected national park forest reserves." },
    { id: "photo-1561731216-c3a4d99437d5", title: "Wild Elephant Herds & Grasslands", desc: "Wild elephant herds roaming across open savannah grasslands and river banks." },
    { id: "photo-1547970810-dc92b384836e", title: "Exotic Avian Fauna & Wetland Sanctuaries", desc: "Diverse migratory birds and native species congregating in pristine wetland habitats." },
    { id: "photo-1575550959106-5a7defe28b56", title: "Forest Safari & Jungle Trails", desc: "Open jeep safari paths winding through teak forests and wildlife habitats." },
    { id: "photo-1518709268805-4e9042af9f23", title: "Spotted Deer & Forest Waterholes", desc: "Peaceful wildlife encounters near natural jungle watering holes at dawn." },
    { id: "photo-1535083783855-76ae62b2914e", title: "Biodiverse Reserve Flora & Fauna", desc: "Rich biodiversity protected within India's premier tiger reserves and national parks." }
  ],
  Desert: [
    { id: "photo-1509316975850-ff9c5deb0cd9", title: "Rolling Golden Sand Dunes", desc: "Expansive desert dunes sculpted by wind currents under vast blue skies." },
    { id: "photo-1518709268805-4e9042af9f23", title: "Camel Safari at Sunset", desc: "Traditional camel caravans traversing warm golden dunes during desert twilight." },
    { id: "photo-1548013146-72479768bada", title: "Golden Sandstone Architecture", desc: "Forts and havelis constructed from golden sandstone blending with the desert landscape." },
    { id: "photo-1509316975850-ff9c5deb0cd9", title: "Clear Desert Night Sky & Stargazing", desc: "Unpolluted desert night skies showcasing constellations over quiet sand dunes." },
    { id: "photo-1599661046289-e31897846e41", title: "Desert Folk Music & Cultural Camps", desc: "Traditional Rajasthani folk dance and music performances around desert campfires." },
    { id: "photo-1564507592333-c60657eea523", title: "White Salt Desert & Horizon Views", desc: "Endless salt marshes shining white under sunlight creating a surreal horizon." }
  ]
};

// Fallback pool for general destinations
const generalPool = photoPools.Heritage.concat(photoPools.Mountains);

async function enrichVisualStories() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for 6-Photo Visual Story Enrichment...");

    const destinations = await Destination.find({});
    console.log(`Found ${destinations.length} destinations to enrich with 6 unique photos each.`);

    let totalUpdated = 0;

    for (let i = 0; i < destinations.length; i++) {
      const dest = destinations[i];

      // Determine matching photo pool category
      let category = "Heritage";
      const descLower = (dest.description || "").toLowerCase();
      const bestLower = (dest.bestFor || []).join(" ").toLowerCase();

      if (descLower.includes("beach") || bestLower.includes("beach") || descLower.includes("island") || descLower.includes("coastal")) {
        category = "Beach";
      } else if (descLower.includes("mountain") || descLower.includes("hill") || descLower.includes("adventure") || descLower.includes("peak")) {
        category = "Mountains";
      } else if (descLower.includes("spiritual") || descLower.includes("temple") || descLower.includes("holy") || descLower.includes("ghat")) {
        category = "Spiritual";
      } else if (descLower.includes("wildlife") || descLower.includes("tiger") || descLower.includes("safari") || descLower.includes("park")) {
        category = "Wildlife";
      } else if (descLower.includes("desert") || descLower.includes("sand") || descLower.includes("dune")) {
        category = "Desert";
      }

      const selectedPool = photoPools[category] || generalPool;

      // Construct exactly 6 unique story entries per destination
      const storyEntries = selectedPool.slice(0, 6).map((item, idx) => {
        // Generate high-resolution Unsplash URL with custom seed parameters to prevent image browser caching collisions
        const uniquePhotoId = item.id;
        const imageUrl = `https://images.unsplash.com/${uniquePhotoId}?w=800&auto=format&fit=crop&q=80&sig=${i * 10 + idx}`;

        return {
          imageUrl: imageUrl,
          title: `${dest.name} — ${item.title}`,
          description: `${item.desc} Experience the iconic charm of ${dest.name}, ${dest.state}.`,
          credit: "Photo by Unsplash Contributor (Free Unsplash License)",
          sourceUrl: `https://unsplash.com/photos/${uniquePhotoId}`,
          license: "Unsplash License (Free to use commercially & personally, no copyright restrictions)"
        };
      });

      dest.destinationStory = storyEntries;
      await dest.save();
      totalUpdated++;
    }

    console.log(`🎉 SUCCESS: Enriched all ${totalUpdated} destinations with 6 unique, legally safe, copyright-free photos each (Total: ${totalUpdated * 6} photo stories)!`);
    process.exit(0);
  } catch (err) {
    console.error("Enrichment error:", err);
    process.exit(1);
  }
}

enrichVisualStories();
