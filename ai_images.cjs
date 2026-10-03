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

const aiImages = {
  desert: ['/assets/ai_desert.jpg'],
  ruins: ['/assets/ai_ruins.jpg'],
  ghadames: ['/assets/ai_ghadames.jpg'],
  city: ['/assets/ai_city.jpg'],
  hotel: ['/assets/ai_hotel.jpg'],
  food: ['/assets/ai_food.jpg']
};

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // We will replace all wikipedia links that I just added, AND any remaining unsplash links
    // The previous script added Wikipedia URLs. Let's match any upload.wikimedia.org OR images.unsplash.com
    const imgRegex = /"https:\/\/(upload\.wikimedia\.org|images\.unsplash\.com)\/[^"]+"/g;
    
    content = content.replace(imgRegex, (match, domain, offset, string) => {
        const contextStart = Math.max(0, offset - 300);
        const contextEnd = Math.min(string.length, offset + 300);
        const context = string.substring(contextStart, contextEnd).toLowerCase();
        
        let pool = [];
        
        if (context.includes('sabratha') || context.includes('cyrene') || context.includes('leptis') || context.includes('لبدة') || context.includes('صبراتة') || context.includes('شحات')) {
            pool = aiImages.ruins;
        } else if (context.includes('ghadames') || context.includes('غدامس')) {
            pool = aiImages.ghadames;
        } else if (context.includes('desert') || context.includes('sahara') || context.includes('ubari') || context.includes('acacus') || context.includes('أوباري') || context.includes('أكاكوس')) {
            pool = aiImages.desert;
        } else if (context.includes('tripoli') || context.includes('benghazi') || context.includes('طرابلس') || context.includes('بنغازي')) {
            pool = aiImages.city;
        } else if (context.includes('food') || context.includes('restaurant') || context.includes('مأكولات') || context.includes('مطعم') || context.includes('cafe')) {
            pool = aiImages.food;
        } else if (context.includes('hotel') || context.includes('resort') || context.includes('فندق') || context.includes('corinthia') || context.includes('tibesti') || context.includes('radisson')) {
            pool = aiImages.hotel;
        } else {
            // fallback generic mix depending on file
            if (file.includes('restaurants')) pool = aiImages.food;
            else if (file.includes('hotels')) pool = aiImages.hotel;
            else pool = aiImages.city;
        }
        
        const selected = pool[Math.floor(Math.random() * pool.length)];
        return `"${selected}"`;
    });
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
