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

const files = walk('c:/Users/i7/Desktop/libya-journeys-pro-main (4)/libya-journeys-pro-main/src/components');

const tripAssets = [
  '/assets/dest-acacus.jpg',
  '/assets/dest-cyrene.jpg',
  '/assets/dest-ghadames.jpg',
  '/assets/dest-sabratah.png',
  '/assets/dest-tripoli.jpg',
  '/assets/dest-ubari.jpg',
  '/assets/hero-leptis.jpg',
  '/assets/offer-desert.jpg'
];

const foodAssets = [
  '/assets/restaurant-libya.jpg',
  '/assets/cafe-libya.jpg'
];

const hotelAssets = [
  '/assets/dest-tripoli.jpg',
  '/assets/hero-leptis.jpg',
  '/assets/guide-hero.jpg',
  '/assets/private-trip.jpg'
];

const allAssets = [...tripAssets, ...foodAssets, ...hotelAssets];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    let isRestaurant = file.includes('restaurants');
    let isHotel = file.includes('hotels');
    
    // Replace all unsplash links with realistic local assets
    content = content.replace(/"https:\/\/images\.unsplash\.com\/photo-[^"]+"/g, () => {
        let list = allAssets;
        if (isRestaurant) list = foodAssets;
        else if (isHotel) list = hotelAssets;
        else list = tripAssets;
        
        return '"' + list[Math.floor(Math.random() * list.length)] + '"';
    });
    
    // Also handle single quotes if any
    content = content.replace(/'https:\/\/images\.unsplash\.com\/photo-[^']+'/g, () => {
        let list = allAssets;
        if (isRestaurant) list = foodAssets;
        else if (isHotel) list = hotelAssets;
        else list = tripAssets;
        
        return "'" + list[Math.floor(Math.random() * list.length)] + "'";
    });
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
