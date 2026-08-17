require("dotenv").config();
const mongoose = require("mongoose");
const Destination = require("./models/Destination");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://singhrajnish7970_db_user:splitsmart123@ac-dkgyga2-shard-00-00.pwhhqde.mongodb.net:27017,ac-dkgyga2-shard-00-01.pwhhqde.mongodb.net:27017,ac-dkgyga2-shard-00-02.pwhhqde.mongodb.net:27017/splitsmart?ssl=true&replicaSet=atlas-p7ruqi-shard-0&authSource=admin&appName=Cluster0";

const rawDestinations = [
  { rank: 1, name: "Agra", state: "Uttar Pradesh", category: "Heritage", emoji: "🏛️", isFeatured: true, cost: { stay: 1800, food: 700, localTransport: 400 }, duration: "1-2 days", season: "October to March" },
  { rank: 2, name: "Jaipur", state: "Rajasthan", category: "Heritage", emoji: "🏰", isFeatured: true, cost: { stay: 2000, food: 800, localTransport: 500 }, duration: "2-3 days", season: "October to March" },
  { rank: 3, name: "Goa", state: "Goa", category: "Beach", emoji: "🏖️", isFeatured: true, cost: { stay: 2500, food: 1000, localTransport: 600 }, duration: "3-5 days", season: "November to February" },
  { rank: 4, name: "Varanasi", state: "Uttar Pradesh", category: "Spiritual", emoji: "🛕", isFeatured: true, cost: { stay: 1200, food: 500, localTransport: 300 }, duration: "2-3 days", season: "October to March" },
  { rank: 5, name: "Manali", state: "Himachal Pradesh", category: "Mountains", emoji: "🏔️", isFeatured: true, cost: { stay: 2200, food: 800, localTransport: 600 }, duration: "3-4 days", season: "October to June" },
  { rank: 6, name: "Leh", state: "Ladakh", category: "Adventure", emoji: "🏔️", isFeatured: true, cost: { stay: 2800, food: 900, localTransport: 1000 }, duration: "5-7 days", season: "May to September" },
  { rank: 7, name: "Srinagar", state: "Jammu & Kashmir", category: "Nature", emoji: "🏔️", isFeatured: true, cost: { stay: 2600, food: 900, localTransport: 700 }, duration: "4-5 days", season: "April to October" },
  { rank: 8, name: "Udaipur", state: "Rajasthan", category: "Heritage", emoji: "🏰", isFeatured: true, cost: { stay: 2400, food: 900, localTransport: 500 }, duration: "2-3 days", season: "September to March" },
  { rank: 9, name: "Amritsar", state: "Punjab", category: "Spiritual", emoji: "🛕", isFeatured: true, cost: { stay: 1500, food: 600, localTransport: 400 }, duration: "1-2 days", season: "October to March" },
  { rank: 10, name: "Kochi", state: "Kerala", category: "Coastal", emoji: "🌴", isFeatured: true, cost: { stay: 2200, food: 800, localTransport: 500 }, duration: "2-3 days", season: "October to March" },
  { rank: 11, name: "Rishikesh", state: "Uttarakhand", category: "Adventure", emoji: "🏔️", isFeatured: true, cost: { stay: 1400, food: 600, localTransport: 400 }, duration: "2-3 days", season: "September to June" },
  { rank: 12, name: "Shimla", state: "Himachal Pradesh", category: "Hill Station", emoji: "🏔️", isFeatured: false, cost: { stay: 2000, food: 750, localTransport: 500 }, duration: "2-3 days", season: "March to June" },
  { rank: 13, name: "Darjeeling", state: "West Bengal", category: "Hill Station", emoji: "🌄", isFeatured: true, cost: { stay: 1900, food: 700, localTransport: 450 }, duration: "3-4 days", season: "April to June" },
  { rank: 14, name: "Munnar", state: "Kerala", category: "Nature", emoji: "🌿", isFeatured: true, cost: { stay: 2100, food: 750, localTransport: 500 }, duration: "2-3 days", season: "September to March" },
  { rank: 15, name: "Jaisalmer", state: "Rajasthan", category: "Desert", emoji: "🏜️", isFeatured: true, cost: { stay: 2300, food: 800, localTransport: 500 }, duration: "2-3 days", season: "October to March" },
  { rank: 16, name: "Jodhpur", state: "Rajasthan", category: "Heritage", emoji: "🏰", isFeatured: false, cost: { stay: 2000, food: 750, localTransport: 450 }, duration: "2-3 days", season: "October to March" },
  { rank: 17, name: "Mumbai", state: "Maharashtra", category: "City", emoji: "🌆", isFeatured: false, cost: { stay: 3500, food: 1200, localTransport: 800 }, duration: "2-4 days", season: "November to February" },
  { rank: 18, name: "Delhi", state: "Delhi", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 2800, food: 1000, localTransport: 600 }, duration: "2-4 days", season: "October to March" },
  { rank: 19, name: "Hampi", state: "Karnataka", category: "Heritage", emoji: "🏛️", isFeatured: true, cost: { stay: 1300, food: 550, localTransport: 350 }, duration: "2-3 days", season: "October to February" },
  { rank: 20, name: "Ooty", state: "Tamil Nadu", category: "Hill Station", emoji: "🌄", isFeatured: true, cost: { stay: 1800, food: 700, localTransport: 450 }, duration: "2-3 days", season: "October to June" },
  { rank: 21, name: "Alappuzha", state: "Kerala", category: "Backwaters", emoji: "🚤", isFeatured: true, cost: { stay: 2500, food: 850, localTransport: 400 }, duration: "2 days", season: "November to February" },
  { rank: 22, name: "Andaman Islands", state: "Andaman & Nicobar", category: "Island", emoji: "🏝️", isFeatured: true, cost: { stay: 3200, food: 1100, localTransport: 900 }, duration: "4-6 days", season: "October to May" },
  { rank: 23, name: "Puducherry", state: "Puducherry", category: "Coastal", emoji: "🌊", isFeatured: false, cost: { stay: 2200, food: 800, localTransport: 450 }, duration: "2-3 days", season: "October to March" },
  { rank: 24, name: "Ranthambore", state: "Rajasthan", category: "Wildlife", emoji: "🐅", isFeatured: false, cost: { stay: 2800, food: 900, localTransport: 700 }, duration: "2 days", season: "October to June" },
  { rank: 25, name: "Jim Corbett", state: "Uttarakhand", category: "Wildlife", emoji: "🐅", isFeatured: false, cost: { stay: 2600, food: 850, localTransport: 650 }, duration: "2-3 days", season: "November to June" },
  { rank: 26, name: "Mussoorie", state: "Uttarakhand", category: "Hill Station", emoji: "🏔️", isFeatured: false, cost: { stay: 2100, food: 750, localTransport: 500 }, duration: "2-3 days", season: "April to June" },
  { rank: 27, name: "Nainital", state: "Uttarakhand", category: "Lake", emoji: "🏞️", isFeatured: false, cost: { stay: 1900, food: 700, localTransport: 450 }, duration: "2-3 days", season: "March to June" },
  { rank: 28, name: "Pahalgam", state: "Jammu & Kashmir", category: "Nature", emoji: "🏔️", isFeatured: true, cost: { stay: 2500, food: 850, localTransport: 600 }, duration: "2-3 days", season: "April to October" },
  { rank: 29, name: "Gulmarg", state: "Jammu & Kashmir", category: "Adventure", emoji: "🎿", isFeatured: false, cost: { stay: 3000, food: 1000, localTransport: 800 }, duration: "2-3 days", season: "December to March" },
  { rank: 30, name: "Kedarnath", state: "Uttarakhand", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1200, food: 500, localTransport: 600 }, duration: "3-4 days", season: "May to October" },
  { rank: 31, name: "Badrinath", state: "Uttarakhand", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1200, food: 500, localTransport: 500 }, duration: "2-3 days", season: "May to October" },
  { rank: 32, name: "Haridwar", state: "Uttarakhand", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1100, food: 450, localTransport: 300 }, duration: "1-2 days", season: "October to March" },
  { rank: 33, name: "Auli", state: "Uttarakhand", category: "Adventure", emoji: "🎿", isFeatured: false, cost: { stay: 2700, food: 900, localTransport: 700 }, duration: "3-4 days", season: "December to March" },
  { rank: 34, name: "Ayodhya", state: "Uttar Pradesh", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1300, food: 500, localTransport: 350 }, duration: "1-2 days", season: "October to March" },
  { rank: 35, name: "Mathura-Vrindavan", state: "Uttar Pradesh", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1200, food: 450, localTransport: 300 }, duration: "1-2 days", season: "October to March" },
  { rank: 36, name: "Lucknow", state: "Uttar Pradesh", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 1800, food: 700, localTransport: 400 }, duration: "2 days", season: "October to March" },
  { rank: 37, name: "Khajuraho", state: "Madhya Pradesh", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 1700, food: 600, localTransport: 350 }, duration: "1-2 days", season: "October to March" },
  { rank: 38, name: "Ujjain", state: "Madhya Pradesh", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1300, food: 500, localTransport: 300 }, duration: "1-2 days", season: "October to March" },
  { rank: 39, name: "Bhopal", state: "Madhya Pradesh", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 1600, food: 600, localTransport: 350 }, duration: "2 days", season: "October to March" },
  { rank: 40, name: "Pachmarhi", state: "Madhya Pradesh", category: "Nature", emoji: "🌿", isFeatured: false, cost: { stay: 1800, food: 650, localTransport: 400 }, duration: "2-3 days", season: "October to June" },
  { rank: 41, name: "Kanha National Park", state: "Madhya Pradesh", category: "Wildlife", emoji: "🐅", isFeatured: false, cost: { stay: 2500, food: 800, localTransport: 600 }, duration: "2-3 days", season: "October to June" },
  { rank: 42, name: "Bandhavgarh", state: "Madhya Pradesh", category: "Wildlife", emoji: "🐅", isFeatured: false, cost: { stay: 2700, food: 850, localTransport: 650 }, duration: "2 days", season: "October to June" },
  { rank: 43, name: "Mahabaleshwar", state: "Maharashtra", category: "Hill Station", emoji: "🌄", isFeatured: false, cost: { stay: 2000, food: 750, localTransport: 450 }, duration: "2 days", season: "October to June" },
  { rank: 44, name: "Lonavala", state: "Maharashtra", category: "Nature", emoji: "🌿", isFeatured: false, cost: { stay: 1900, food: 700, localTransport: 400 }, duration: "1-2 days", season: "July to March" },
  { rank: 45, name: "Nashik", state: "Maharashtra", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1600, food: 600, localTransport: 350 }, duration: "2 days", season: "October to March" },
  { rank: 46, name: "Chhatrapati Sambhajinagar", state: "Maharashtra", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 1700, food: 650, localTransport: 400 }, duration: "2 days", season: "October to March" },
  { rank: 47, name: "Ajanta Caves", state: "Maharashtra", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 1500, food: 550, localTransport: 350 }, duration: "1 day", season: "October to March" },
  { rank: 48, name: "Ellora Caves", state: "Maharashtra", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 1500, food: 550, localTransport: 350 }, duration: "1 day", season: "October to March" },
  { rank: 49, name: "Alibaug", state: "Maharashtra", category: "Beach", emoji: "🏖️", isFeatured: false, cost: { stay: 2200, food: 800, localTransport: 450 }, duration: "2 days", season: "November to March" },
  { rank: 50, name: "Hyderabad", state: "Telangana", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 2300, food: 850, localTransport: 500 }, duration: "2-3 days", season: "October to March" },
  { rank: 51, name: "Warangal", state: "Telangana", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 1400, food: 500, localTransport: 300 }, duration: "1-2 days", season: "October to March" },
  { rank: 52, name: "Visakhapatnam", state: "Andhra Pradesh", category: "Coastal", emoji: "🏖️", isFeatured: false, cost: { stay: 2000, food: 700, localTransport: 450 }, duration: "2-3 days", season: "October to March" },
  { rank: 53, name: "Tirupati", state: "Andhra Pradesh", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1300, food: 500, localTransport: 350 }, duration: "1-2 days", season: "September to March" },
  { rank: 54, name: "Araku Valley", state: "Andhra Pradesh", category: "Nature", emoji: "🌄", isFeatured: false, cost: { stay: 1600, food: 550, localTransport: 400 }, duration: "2 days", season: "September to March" },
  { rank: 55, name: "Mysuru", state: "Karnataka", category: "Heritage", emoji: "🏰", isFeatured: false, cost: { stay: 1900, food: 700, localTransport: 400 }, duration: "2 days", season: "October to March" },
  { rank: 56, name: "Coorg", state: "Karnataka", category: "Nature", emoji: "🌿", isFeatured: false, cost: { stay: 2200, food: 800, localTransport: 500 }, duration: "2-3 days", season: "October to March" },
  { rank: 57, name: "Bengaluru", state: "Karnataka", category: "City", emoji: "🌆", isFeatured: false, cost: { stay: 2800, food: 1000, localTransport: 600 }, duration: "2-3 days", season: "October to February" },
  { rank: 58, name: "Gokarna", state: "Karnataka", category: "Beach", emoji: "🏖️", isFeatured: false, cost: { stay: 1500, food: 600, localTransport: 350 }, duration: "2-3 days", season: "October to March" },
  { rank: 59, name: "Badami", state: "Karnataka", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 1400, food: 500, localTransport: 300 }, duration: "1-2 days", season: "October to March" },
  { rank: 60, name: "Kovalam", state: "Kerala", category: "Beach", emoji: "🏖️", isFeatured: false, cost: { stay: 2400, food: 850, localTransport: 450 }, duration: "2-3 days", season: "November to February" },
  { rank: 61, name: "Varkala", state: "Kerala", category: "Beach", emoji: "🏖️", isFeatured: false, cost: { stay: 2100, food: 750, localTransport: 400 }, duration: "2-3 days", season: "October to March" },
  { rank: 62, name: "Wayanad", state: "Kerala", category: "Nature", emoji: "🌿", isFeatured: false, cost: { stay: 2000, food: 700, localTransport: 450 }, duration: "2-3 days", season: "October to May" },
  { rank: 63, name: "Thekkady", state: "Kerala", category: "Wildlife", emoji: "🐘", isFeatured: false, cost: { stay: 2100, food: 750, localTransport: 450 }, duration: "2 days", season: "October to March" },
  { rank: 64, name: "Kumarakom", state: "Kerala", category: "Backwaters", emoji: "🚤", isFeatured: false, cost: { stay: 2600, food: 900, localTransport: 450 }, duration: "2 days", season: "November to February" },
  { rank: 65, name: "Kodaikanal", state: "Tamil Nadu", category: "Hill Station", emoji: "🏔️", isFeatured: false, cost: { stay: 1900, food: 700, localTransport: 450 }, duration: "2-3 days", season: "October to June" },
  { rank: 66, name: "Chennai", state: "Tamil Nadu", category: "City", emoji: "🌆", isFeatured: false, cost: { stay: 2400, food: 850, localTransport: 500 }, duration: "2-3 days", season: "November to February" },
  { rank: 67, name: "Madurai", state: "Tamil Nadu", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1500, food: 550, localTransport: 350 }, duration: "1-2 days", season: "October to March" },
  { rank: 68, name: "Rameswaram", state: "Tamil Nadu", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1400, food: 500, localTransport: 350 }, duration: "1-2 days", season: "October to April" },
  { rank: 69, name: "Kanyakumari", state: "Tamil Nadu", category: "Coastal", emoji: "🌊", isFeatured: false, cost: { stay: 1600, food: 600, localTransport: 350 }, duration: "1-2 days", season: "October to March" },
  { rank: 70, name: "Thanjavur", state: "Tamil Nadu", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 1500, food: 550, localTransport: 350 }, duration: "1-2 days", season: "October to March" },
  { rank: 71, name: "Mahabalipuram", state: "Tamil Nadu", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 2000, food: 750, localTransport: 400 }, duration: "1-2 days", season: "October to March" },
  { rank: 72, name: "Gangtok", state: "Sikkim", category: "Mountains", emoji: "🏔️", isFeatured: false, cost: { stay: 2200, food: 800, localTransport: 600 }, duration: "3-4 days", season: "October to June" },
  { rank: 73, name: "Pelling", state: "Sikkim", category: "Mountains", emoji: "🏔️", isFeatured: false, cost: { stay: 1900, food: 700, localTransport: 550 }, duration: "2-3 days", season: "October to May" },
  { rank: 74, name: "Shillong", state: "Meghalaya", category: "Nature", emoji: "🌿", isFeatured: true, cost: { stay: 2100, food: 750, localTransport: 550 }, duration: "3-4 days", season: "September to May" },
  { rank: 75, name: "Cherrapunji", state: "Meghalaya", category: "Nature", emoji: "🌧️", isFeatured: false, cost: { stay: 2000, food: 700, localTransport: 500 }, duration: "2 days", season: "October to May" },
  { rank: 76, name: "Kaziranga", state: "Assam", category: "Wildlife", emoji: "🦏", isFeatured: false, cost: { stay: 2500, food: 800, localTransport: 600 }, duration: "2 days", season: "November to April" },
  { rank: 77, name: "Guwahati", state: "Assam", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1700, food: 600, localTransport: 400 }, duration: "2 days", season: "October to April" },
  { rank: 78, name: "Majuli", state: "Assam", category: "Culture", emoji: "🌿", isFeatured: false, cost: { stay: 1200, food: 450, localTransport: 300 }, duration: "2 days", season: "October to March" },
  { rank: 79, name: "Tawang", state: "Arunachal Pradesh", category: "Mountains", emoji: "🏔️", isFeatured: false, cost: { stay: 2300, food: 750, localTransport: 800 }, duration: "4-5 days", season: "March to October" },
  { rank: 80, name: "Ziro Valley", state: "Arunachal Pradesh", category: "Nature", emoji: "🌿", isFeatured: false, cost: { stay: 1800, food: 600, localTransport: 600 }, duration: "3 days", season: "September to November" },
  { rank: 81, name: "Kohima", state: "Nagaland", category: "Culture", emoji: "🏔️", isFeatured: false, cost: { stay: 1900, food: 650, localTransport: 500 }, duration: "2-3 days", season: "October to May" },
  { rank: 82, name: "Aizawl", state: "Mizoram", category: "Mountains", emoji: "🏔️", isFeatured: false, cost: { stay: 1800, food: 600, localTransport: 500 }, duration: "2-3 days", season: "October to March" },
  { rank: 83, name: "Imphal", state: "Manipur", category: "Nature", emoji: "🌿", isFeatured: false, cost: { stay: 1700, food: 600, localTransport: 450 }, duration: "2 days", season: "October to April" },
  { rank: 84, name: "Bhubaneswar", state: "Odisha", category: "Heritage", emoji: "🛕", isFeatured: false, cost: { stay: 1600, food: 600, localTransport: 350 }, duration: "2 days", season: "October to March" },
  { rank: 85, name: "Puri", state: "Odisha", category: "Spiritual", emoji: "🏖️", isFeatured: false, cost: { stay: 1800, food: 650, localTransport: 400 }, duration: "2-3 days", season: "October to March" },
  { rank: 86, name: "Konark", state: "Odisha", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 1500, food: 550, localTransport: 350 }, duration: "1 day", season: "October to March" },
  { rank: 87, name: "Kolkata", state: "West Bengal", category: "City", emoji: "🌆", isFeatured: false, cost: { stay: 2200, food: 800, localTransport: 450 }, duration: "3-4 days", season: "October to March" },
  { rank: 88, name: "Sundarbans", state: "West Bengal", category: "Wildlife", emoji: "🐅", isFeatured: false, cost: { stay: 2300, food: 750, localTransport: 600 }, duration: "2-3 days", season: "September to March" },
  { rank: 89, name: "Bodh Gaya", state: "Bihar", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1300, food: 500, localTransport: 300 }, duration: "1-2 days", season: "October to March" },
  { rank: 90, name: "Patna", state: "Bihar", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 1400, food: 500, localTransport: 300 }, duration: "1-2 days", season: "October to March" },
  { rank: 91, name: "Dwarka", state: "Gujarat", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1500, food: 550, localTransport: 350 }, duration: "1-2 days", season: "October to March" },
  { rank: 92, name: "Ahmedabad", state: "Gujarat", category: "Heritage", emoji: "🏛️", isFeatured: false, cost: { stay: 2000, food: 750, localTransport: 450 }, duration: "2-3 days", season: "October to March" },
  { rank: 93, name: "Rann of Kutch", state: "Gujarat", category: "Desert", emoji: "🏜️", isFeatured: false, cost: { stay: 2600, food: 850, localTransport: 600 }, duration: "2-3 days", season: "November to February" },
  { rank: 94, name: "Gir National Park", state: "Gujarat", category: "Wildlife", emoji: "🦁", isFeatured: false, cost: { stay: 2700, food: 850, localTransport: 650 }, duration: "2 days", season: "December to March" },
  { rank: 95, name: "Diu", state: "Daman & Diu", category: "Beach", emoji: "🏖️", isFeatured: false, cost: { stay: 2000, food: 700, localTransport: 400 }, duration: "2 days", season: "October to May" },
  { rank: 96, name: "Lakshadweep", state: "Lakshadweep", category: "Island", emoji: "🏝️", isFeatured: false, cost: { stay: 3500, food: 1200, localTransport: 800 }, duration: "4-5 days", season: "October to May" },
  { rank: 97, name: "Kavaratti", state: "Lakshadweep", category: "Island", emoji: "🏝️", isFeatured: false, cost: { stay: 3400, food: 1100, localTransport: 750 }, duration: "3 days", season: "October to May" },
  { rank: 98, name: "Pushkar", state: "Rajasthan", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1600, food: 600, localTransport: 350 }, duration: "2 days", season: "October to March" },
  { rank: 99, name: "Mount Abu", state: "Rajasthan", category: "Hill Station", emoji: "🏔️", isFeatured: false, cost: { stay: 1900, food: 700, localTransport: 450 }, duration: "2 days", season: "October to June" },
  { rank: 100, name: "Amritsar Golden Temple Region", state: "Punjab", category: "Spiritual", emoji: "🛕", isFeatured: false, cost: { stay: 1500, food: 600, localTransport: 400 }, duration: "2 days", season: "October to March" }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for 100 Destinations seeding...");

    await Destination.deleteMany({});
    console.log("Cleared existing destinations collection.");

    const formatted = rawDestinations.map((d) => ({
      name: d.name,
      state: d.state,
      description: `${d.emoji} ${d.name} is a premier ${d.category.toLowerCase()} destination in ${d.state}, famous for its stunning landscapes, cultural heritage, local cuisine, and unique travel experiences.`,
      bestFor: [d.category.toLowerCase(), "culture", "sightseeing", "food"],
      topFood: ["Local Thali", "Specialty Street Food", "Regional Sweets", "Traditional Tea"],
      topAttractions: [`${d.name} Main Viewpoint`, "Historic Center", "Local Bazaar", "Cultural Heritage Site"],
      bestSeason: d.season,
      recommendedDuration: d.duration,
      geography: `${d.name} is situated in ${d.state}, characterized by scenic ${d.category.toLowerCase()} terrain and distinctive regional landscapes.`,
      history: `${d.name} possesses rich historical significance in ${d.state}, with centuries of cultural traditions and architectural legacy.`,
      culture: `The culture of ${d.name} blends regional music, festivals, warm hospitality, and iconic local handicrafts.`,
      climate: `Enjoys seasonal weather with peak pleasant travel conditions during ${d.season}.`,
      travelInfo: `${d.name} is well-connected by road, rail, and nearby airport hubs. Taxis and local transports are readily available.`,
      avgCostPerPersonPerDay: d.cost,
      destinationStory: [
        {
          imageUrl: `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800`,
          title: `Explore ${d.name}`,
          description: `Experience the breathtaking ${d.category.toLowerCase()} beauty and cultural heritage of ${d.name}, ${d.state}.`,
          credit: "Unsplash",
          sourceUrl: "https://unsplash.com",
          license: "Unsplash License"
        }
      ]
    }));

    await Destination.insertMany(formatted);
    console.log(`Successfully seeded ${formatted.length} Indian destinations into MongoDB Atlas! 🎉`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
