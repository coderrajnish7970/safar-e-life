require("dotenv").config();
const mongoose = require("mongoose");
const Destination = require("./models/Destination");

const destinations = [
 {
  name: "Goa",
  state: "Goa",

  description:
    "Beaches, nightlife, Portuguese heritage, tropical landscapes and a relaxed coastal lifestyle on India's west coast.",

  bestFor: [
    "beach",
    "nightlife",
    "relaxation",
    "culture",
    "food"
  ],

  topFood: [
    "Goan fish curry",
    "Bebinca",
    "Prawn balchao",
    "Feni cocktails"
  ],

  topAttractions: [
    "Baga Beach",
    "Fort Aguada",
    "Dudhsagar Falls",
    "Basilica of Bom Jesus"
  ],

  bestSeason: "November to February",

  recommendedDuration: "3-5 days",

  
  geography:
    "Goa is a coastal state on India's western coast along the Arabian Sea. It is known for sandy beaches, tropical landscapes, rivers, forests and a diverse coastal environment.",

  history:
    "Goa has a long history shaped by ancient Indian kingdoms, maritime trade and centuries of Portuguese rule. Its historic churches, forts, old quarters and architecture reflect this layered past.",

  culture:
    "Goan culture blends Konkani traditions with Portuguese influences. Music, festivals, local markets, architecture and seafood cuisine are important parts of the state's distinctive cultural identity.",

  climate:
    "Goa has a tropical climate with hot summers, a humid monsoon season and relatively pleasant winters. November to February is generally popular for beach trips and sightseeing.",

  travelInfo:
    "Goa is well connected by air, rail and road. Dabolim Airport and Manohar International Airport serve the region, while major railway stations connect Goa with cities across India. Taxis, rental scooters and local buses are commonly used for getting around.",
destinationStory: [
    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Baga_Beach,_Goa.jpg",
      title: "Baga Beach",
      description:
        "Baga Beach captures the energetic side of Goa, with golden sand, Arabian Sea views, water activities, beach shacks and a lively atmosphere.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Category:Baga_Beach",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Fort_Aguada%2C_Goa%2C_India.jpg",
      title: "Fort Aguada",
      description:
        "Built during Portuguese rule, Fort Aguada combines coastal history with sweeping views of the Arabian Sea.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Category:Fort_Aguada",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Dudhsagar_Falls.jpg",
      title: "Dudhsagar Falls",
      description:
        "Dudhsagar is one of Goa's most spectacular natural attractions, where water cascades down a dramatic forested landscape.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Category:Dudhsagar_Falls",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Basilica_Of_Bom_Jesus%2C_Goa.jpg",
      title: "Basilica of Bom Jesus",
      description:
        "This historic basilica is one of Goa's most important landmarks and reflects the region's distinctive Portuguese-era heritage.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Category:Basilica_of_Bom_Jesus",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Palolem_Beach.jpg",
      title: "Palolem Beach",
      description:
        "Palolem offers a quieter coastal experience with palm-lined shores, calm waters and a relaxed South Goa atmosphere.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Category:Palolem",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Goan_Backwaters.jpeg",
      title: "Goa's Tropical Waterways",
      description:
        "Beyond its beaches, Goa has peaceful waterways and lush landscapes that reveal a slower and more natural side of the state.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Category:Waterways_of_Goa",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Goa%20sunset.jpg",
      title: "Goa at Sunset",
      description:
        "Goa's western coastline creates memorable sunsets, turning the beaches into one of the most atmospheric parts of the evening.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Category:Sunsets_in_Goa",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Fontainhas%2C_the_Latin_Quarter_of_Panjim%2C_Goa.jpg",
      title: "Fontainhas",
      description:
        "Fontainhas in Panaji is known for colorful Portuguese-influenced buildings, narrow streets and a distinctive cultural atmosphere.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Category:Fontainhas,_Goa",
      license: "Creative Commons"
    }
  ],

  avgCostPerPersonPerDay: {
    stay: 1500,
    food: 800,
    localTransport: 300
  }
},
  {
  name: "Manali",
  state: "Himachal Pradesh",

  description:
    "A beautiful Himalayan destination known for dramatic mountain landscapes, adventure, rivers, forests, local culture, and memorable experiences with friends and family.",

  bestFor: [
    "mountains",
    "adventure",
    "family",
    "friends",
    "nature",
    "photography"
  ],

  topFood: [
    "Siddu",
    "Trout fish",
    "Thukpa",
    "Chana Madra"
  ],

  topAttractions: [
    "Solang Valley",
    "Rohtang Pass",
    "Hadimba Temple",
    "Old Manali",
    "Beas River",
    "Vashisht Hot Springs"
  ],

  bestSeason: "March to June and October to February",

  recommendedDuration: "4-6 days",

  geography:
    "Manali lies in the Kullu Valley of Himachal Pradesh in the western Himalayas. The region is surrounded by high mountains, forests, valleys and the Beas River.",

  history:
    "Manali and the surrounding Kullu Valley have a long cultural history connected with Himalayan traditions, temples and historic settlements. Hadimba Temple and Old Manali reflect the distinctive heritage of the region.",

  culture:
    "Manali has a strong Himachali cultural identity expressed through traditional architecture, temples, festivals, handicrafts, local food and the lifestyle of mountain communities.",

  climate:
    "Manali has pleasant summers and cold winters. Higher areas can receive snowfall during winter, while spring and summer are popular for sightseeing and outdoor activities.",

  travelInfo:
    "Manali is well connected by road with major cities in North India. Bhuntar is the nearest airport, while Chandigarh and Delhi are commonly used gateways for road travel. Local taxis and buses are available for nearby attractions.",

  destinationStory: [
    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Old_Manali.jpg",
      title: "The Himalayan Setting",
      description:
        "Manali sits in the Kullu Valley surrounded by dramatic Himalayan mountains, forests and valleys. This mountain setting is one of the defining reasons travelers come here.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Manali,_Himachal_Pradesh",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Solang_valley.jpg",
      title: "Solang Valley",
      description:
        "Solang Valley is one of the best-known adventure areas around Manali, offering spectacular mountain scenery and outdoor activities.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Solang_valley.jpg",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Hadimba_temple_at_Manali.jpg",
      title: "Hadimba Devi Temple",
      description:
        "Hadimba Devi Temple is one of Manali's most important cultural landmarks. Its distinctive architecture and forest setting make it an essential stop for visitors.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Hadimba_temple_at_Manali.jpg",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Old_manali.jpg",
      title: "Old Manali",
      description:
        "Old Manali offers a slower and more intimate side of the destination, with mountain views, local streets, traditional buildings, cafes and everyday Himalayan life.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Old_manali.jpg",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Beas_River_-_Manali%2C_Himachal_Pradesh%2C_India_-_rohanakakaka.jpg",
      title: "The Beas River",
      description:
        "The Beas River runs through Manali and the surrounding Kullu Valley. Its mountain water and surrounding landscape are an important part of the region's natural character.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Beas_River_-_Manali,_Himachal_Pradesh,_India_-_rohanakakaka.jpg",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Rohtang_Pass%2C_Manali%2C_Himachal_Pradesh.jpg",
      title: "Rohtang Pass",
      description:
        "Rohtang Pass is a dramatic high-altitude mountain destination associated with the Manali region. Snow-covered landscapes and high Himalayan terrain make the journey part of the experience.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Manali,_Himachal_Pradesh",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Himalayan_Nyinmapa_Buddhist_Monastery%2C_Manali.jpg",
      title: "Himalayan Buddhist Heritage",
      description:
        "Manali's cultural landscape also includes Buddhist traditions and monasteries. These places add another dimension to the cultural identity of the region.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Manali,_Himachal_Pradesh",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Mall_Road%2C_Manali%2C_Himachal_Pradesh.jpg",
      title: "Mall Road",
      description:
        "Mall Road is the lively center of Manali, where visitors can experience shopping, local food, cafes and the everyday atmosphere of the town.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Manali,_Himachal_Pradesh",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Vashisht_temple_near_manali.jpg",
      title: "Vashisht Village",
      description:
        "Vashisht is known for its historic temples and natural hot springs. The village offers visitors a glimpse into the spiritual and traditional side of the Manali region.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Manali,_Himachal_Pradesh",
      license: "Creative Commons"
    },

    {
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Snow_covered_Rohtang_Pass.jpg",
      title: "Snowy Himalayas",
      description:
        "Snow transforms the higher Himalayan landscape around Manali into a completely different experience. Winter scenery is one of the reasons the region attracts travelers seeking snow and mountain adventures.",
      credit: "Wikimedia Commons",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Manali,_Himachal_Pradesh",
      license: "Creative Commons"
    }
  ],

  avgCostPerPersonPerDay: {
    stay: 1200,
    food: 600,
    localTransport: 400
  }
},
  { name: "Jaipur", state: "Rajasthan", description: "The Pink City, known for forts, palaces, and royal heritage.", bestFor: ["heritage", "culture", "shopping"], topFood: ["Dal Baati Churma", "Laal Maas", "Pyaaz Kachori", "Ghewar"], topAttractions: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar"], bestSeason: "October to March", recommendedDuration: "2-3 days", avgCostPerPersonPerDay: { stay: 1000, food: 500, localTransport: 250 } },
  { name: "Rishikesh", state: "Uttarakhand", description: "Yoga capital of the world, on the banks of the Ganges, popular for adventure and spirituality.", bestFor: ["adventure", "spirituality", "nature"], topFood: ["Aloo Puri", "Chotiwala Thali", "Sattu Paratha"], topAttractions: ["Laxman Jhula", "Triveni Ghat", "Neer Garh Waterfall", "River Rafting"], bestSeason: "September to April", recommendedDuration: "2-4 days", avgCostPerPersonPerDay: { stay: 900, food: 450, localTransport: 200 } },
  { name: "Andaman Islands", state: "Andaman and Nicobar Islands", description: "Tropical islands with pristine beaches and scuba diving spots.", bestFor: ["beach", "scuba diving", "island life"], topFood: ["Fresh seafood platters", "Coconut prawn curry", "Grilled fish"], topAttractions: ["Radhanagar Beach", "Cellular Jail", "Havelock Island", "Ross Island"], bestSeason: "October to May", recommendedDuration: "5-7 days", avgCostPerPersonPerDay: { stay: 2200, food: 1000, localTransport: 500 } },
  { name: "Munnar", state: "Kerala", description: "Hill station covered in tea plantations, misty and cool year round.", bestFor: ["mountains", "nature", "relaxation"], topFood: ["Kerala Sadya", "Appam with stew", "Karimeen fry"], topAttractions: ["Tea Museum", "Eravikulam National Park", "Mattupetty Dam", "Top Station"], bestSeason: "September to May", recommendedDuration: "3-4 days", avgCostPerPersonPerDay: { stay: 1300, food: 550, localTransport: 350 } },
  { name: "Udaipur", state: "Rajasthan", description: "The City of Lakes, famous for palaces and romantic lake views.", bestFor: ["heritage", "romance", "lakes"], topFood: ["Dal Baati", "Laal Maas", "Mirchi Bada"], topAttractions: ["City Palace", "Lake Pichola", "Jag Mandir", "Saheliyon ki Bari"], bestSeason: "September to March", recommendedDuration: "2-3 days", avgCostPerPersonPerDay: { stay: 1400, food: 600, localTransport: 300 } },
  { name: "Jaisalmer", state: "Rajasthan", description: "The Golden City, desert forts and camel safaris in the Thar Desert.", bestFor: ["desert", "heritage", "adventure"], topFood: ["Ker Sangri", "Dal Baati Churma", "Rajasthani Thali"], topAttractions: ["Jaisalmer Fort", "Sam Sand Dunes", "Patwon Ki Haveli", "Gadisar Lake"], bestSeason: "November to February", recommendedDuration: "2-3 days", avgCostPerPersonPerDay: { stay: 1100, food: 500, localTransport: 350 } },
  { name: "Shimla", state: "Himachal Pradesh", description: "Colonial hill station with pine forests and toy train rides.", bestFor: ["mountains", "colonial architecture", "family"], topFood: ["Siddu", "Chana Madra", "Babru"], topAttractions: ["The Ridge", "Mall Road", "Kufri", "Jakhoo Temple"], bestSeason: "March to June, December to February", recommendedDuration: "3-4 days", avgCostPerPersonPerDay: { stay: 1200, food: 550, localTransport: 300 } },
  { name: "Darjeeling", state: "West Bengal", description: "Tea gardens and Himalayan views in the northeast hills.", bestFor: ["mountains", "tea gardens", "nature"], topFood: ["Momos", "Thukpa", "Darjeeling tea"], topAttractions: ["Tiger Hill", "Batasia Loop", "Darjeeling Himalayan Railway", "Peace Pagoda"], bestSeason: "March to May, October to December", recommendedDuration: "3-4 days", avgCostPerPersonPerDay: { stay: 1100, food: 500, localTransport: 300 } },
  { name: "Ladakh", state: "Ladakh", description: "High-altitude desert with dramatic landscapes and Buddhist monasteries.", bestFor: ["mountains", "adventure", "spirituality"], topFood: ["Thukpa", "Momos", "Butter tea"], topAttractions: ["Pangong Lake", "Nubra Valley", "Magnetic Hill", "Leh Palace"], bestSeason: "May to September", recommendedDuration: "6-8 days", avgCostPerPersonPerDay: { stay: 1600, food: 700, localTransport: 600 } },
  { name: "Varanasi", state: "Uttar Pradesh", description: "One of the oldest living cities, spiritual hub on the Ganges.", bestFor: ["spirituality", "heritage", "culture"], topFood: ["Kachori Sabzi", "Banarasi Paan", "Lassi"], topAttractions: ["Dashashwamedh Ghat", "Kashi Vishwanath Temple", "Sarnath", "Ganga Aarti"], bestSeason: "October to March", recommendedDuration: "2-3 days", avgCostPerPersonPerDay: { stay: 900, food: 400, localTransport: 200 } },
  { name: "Agra", state: "Uttar Pradesh", description: "Home to the Taj Mahal and rich Mughal architecture.", bestFor: ["heritage", "architecture", "history"], topFood: ["Petha", "Mughlai cuisine", "Bedai"], topAttractions: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Mehtab Bagh"], bestSeason: "October to March", recommendedDuration: "1-2 days", avgCostPerPersonPerDay: { stay: 1000, food: 450, localTransport: 250 } },
  { name: "Mumbai", state: "Maharashtra", description: "India's financial capital, a mix of colonial architecture and Bollywood glamour.", bestFor: ["city life", "nightlife", "food"], topFood: ["Vada Pav", "Pav Bhaji", "Bombay Sandwich"], topAttractions: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Juhu Beach"], bestSeason: "November to February", recommendedDuration: "2-4 days", avgCostPerPersonPerDay: { stay: 1800, food: 800, localTransport: 400 } },
  { name: "Pondicherry", state: "Puducherry", description: "French colonial charm with beaches and a laid-back vibe.", bestFor: ["beach", "relaxation", "culture"], topFood: ["French pastries", "South Indian thali", "Seafood"], topAttractions: ["French Quarter", "Auroville", "Promenade Beach", "Paradise Beach"], bestSeason: "October to March", recommendedDuration: "2-3 days", avgCostPerPersonPerDay: { stay: 1200, food: 550, localTransport: 250 } },
  { name: "Coorg", state: "Karnataka", description: "Coffee plantations and misty hills in the Western Ghats.", bestFor: ["nature", "coffee", "relaxation"], topFood: ["Pandi curry", "Kadambuttu", "Coorg coffee"], topAttractions: ["Abbey Falls", "Raja's Seat", "Namdroling Monastery", "Dubare Elephant Camp"], bestSeason: "October to March", recommendedDuration: "3-4 days", avgCostPerPersonPerDay: { stay: 1300, food: 550, localTransport: 300 } },
  { name: "Hampi", state: "Karnataka", description: "Ancient ruins of the Vijayanagara Empire amid boulder landscapes.", bestFor: ["heritage", "history", "adventure"], topFood: ["South Indian thali", "Banana specialties"], topAttractions: ["Virupaksha Temple", "Vittala Temple", "Matanga Hill", "Hampi Bazaar"], bestSeason: "October to February", recommendedDuration: "2-3 days", avgCostPerPersonPerDay: { stay: 900, food: 400, localTransport: 250 } },
  { name: "Alleppey", state: "Kerala", description: "Backwaters and houseboat cruises through Kerala's canals.", bestFor: ["backwaters", "relaxation", "nature"], topFood: ["Kerala Sadya", "Karimeen fry", "Toddy shop food"], topAttractions: ["Alleppey Backwaters", "Houseboat Cruise", "Alappuzha Beach", "Marari Beach"], bestSeason: "November to February", recommendedDuration: "2-3 days", avgCostPerPersonPerDay: { stay: 1700, food: 600, localTransport: 300 } },
  { name: "Mysore", state: "Karnataka", description: "Royal city known for its palace and silk sarees.", bestFor: ["heritage", "culture", "shopping"], topFood: ["Mysore Pak", "Masala Dosa", "Mysore Bonda"], topAttractions: ["Mysore Palace", "Chamundi Hill", "Brindavan Gardens", "St. Philomena's Church"], bestSeason: "October to March", recommendedDuration: "2 days", avgCostPerPersonPerDay: { stay: 1000, food: 450, localTransport: 250 } },
  { name: "Gangtok", state: "Sikkim", description: "Himalayan capital with monasteries and mountain views of Kanchenjunga.", bestFor: ["mountains", "spirituality", "nature"], topFood: ["Momos", "Thukpa", "Gundruk"], topAttractions: ["MG Marg", "Tsomgo Lake", "Rumtek Monastery", "Nathula Pass"], bestSeason: "March to June, October to December", recommendedDuration: "4-5 days", avgCostPerPersonPerDay: { stay: 1300, food: 550, localTransport: 400 } },
  { name: "Amritsar", state: "Punjab", description: "Home to the Golden Temple and rich Sikh heritage.", bestFor: ["spirituality", "culture", "food"], topFood: ["Amritsari Kulcha", "Lassi", "Butter Chicken"], topAttractions: ["Golden Temple", "Wagah Border", "Jallianwala Bagh", "Partition Museum"], bestSeason: "October to March", recommendedDuration: "1-2 days", avgCostPerPersonPerDay: { stay: 900, food: 400, localTransport: 200 } },
  { name: "Kolkata", state: "West Bengal", description: "City of joy, colonial architecture and rich cultural heritage.", bestFor: ["culture", "food", "heritage"], topFood: ["Rosogolla", "Kathi Rolls", "Fish curry"], topAttractions: ["Victoria Memorial", "Howrah Bridge", "Park Street", "Dakshineswar Temple"], bestSeason: "October to March", recommendedDuration: "2-3 days", avgCostPerPersonPerDay: { stay: 1100, food: 500, localTransport: 250 } },
  { name: "Ooty", state: "Tamil Nadu", description: "Queen of hill stations, tea gardens and colonial charm in the Nilgiris.", bestFor: ["mountains", "nature", "family"], topFood: ["South Indian thali", "Homemade chocolates", "Ooty tea"], topAttractions: ["Ooty Lake", "Botanical Garden", "Doddabetta Peak", "Nilgiri Mountain Railway"], bestSeason: "October to June", recommendedDuration: "2-3 days", avgCostPerPersonPerDay: { stay: 1100, food: 500, localTransport: 300 } },
  { name: "Spiti Valley", state: "Himachal Pradesh", description: "Remote cold desert valley with monasteries and dramatic Himalayan terrain.", bestFor: ["mountains", "adventure", "photography"], topFood: ["Thukpa", "Momos", "Local Himalayan cuisine"], topAttractions: ["Key Monastery", "Chandratal Lake", "Pin Valley", "Kaza"], bestSeason: "May to October", recommendedDuration: "6-7 days", avgCostPerPersonPerDay: { stay: 1400, food: 600, localTransport: 500 } },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB, seeding destinations...");

    for (const dest of destinations) {
      await Destination.findOneAndUpdate(
        { name: dest.name },
        dest,
        { upsert: true, returnDocument: "after" }
      );
    }

    console.log("Seeded " + destinations.length + " destinations successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding destinations:", err.message);
    process.exit(1);
  });


