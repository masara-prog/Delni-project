const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const dirs = [
    'c:/Users/i7/Desktop/libya-journeys-pro-main (4)/libya-journeys-pro-main/src/routes',
    'c:/Users/i7/Desktop/libya-journeys-pro-main (4)/libya-journeys-pro-main/src/components'
];

let files = [];
dirs.forEach(d => { files = files.concat(walk(d)); });

const desert = [
  'https://images.unsplash.com/photo-1682687982185-531d09ec56fc',
  'https://images.unsplash.com/photo-1547234935-80c7145ec969',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9',
  'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0',
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba'
];

const ruins = [
  'https://images.unsplash.com/photo-1552524451-b8fb217f2bc2',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
  'https://images.unsplash.com/photo-1548013146-72479768bada',
  'https://images.unsplash.com/photo-1599839619722-39751411ea63'
];

const coast = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5',
  'https://images.unsplash.com/photo-1511497584788-87676104235f',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd'
];

const hotels = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
  'https://images.unsplash.com/photo-1497361124515-0d04b6bdf675',
  'https://images.unsplash.com/photo-1551882547-ff40c6d81397'
];

const food = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae',
  'https://images.unsplash.com/photo-1414235077428-971145534556',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330',
  'https://images.unsplash.com/photo-1504670073073-6123e39e0754'
];

// Helper to get random item
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    let isHotel = file.includes('hotels.tsx') || file.includes('HotelDetailsModal');
    let isRestaurant = file.includes('restaurants.tsx');
    let isTrips = file.includes('trips.tsx');
    let isAttractions = file.includes('attractions.tsx');
    
    const assetRegex = /['"]\/assets\/[^'"]+\.(jpg|png)['"]/g;
    
    content = content.replace(assetRegex, (match) => {
        let replacement = '';
        if (isHotel) replacement = rand(hotels);
        else if (isRestaurant) replacement = rand(food);
        else {
            // For trips/attractions, mix ruins, desert, coast
            const mix = [...ruins, ...desert, ...coast];
            replacement = rand(mix);
        }
        
        // Use double quotes for consistency, append Unsplash params for high quality
        return `"${replacement}?auto=format&fit=crop&w=1200&q=80"`;
    });
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
