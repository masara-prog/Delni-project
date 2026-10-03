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

const files = walk('c:/Users/i7/Desktop/libya-journeys-pro-main (4)/libya-journeys-pro-main/src/routes');
files.push('c:/Users/i7/Desktop/libya-journeys-pro-main (4)/libya-journeys-pro-main/src/components/Modals.tsx');
files.push('c:/Users/i7/Desktop/libya-journeys-pro-main (4)/libya-journeys-pro-main/src/components/HotelDetailsModal.tsx');

const realLibyaImages = {
  // Landmarks
  leptis: [
    'https://upload.wikimedia.org/wikipedia/commons/c/c8/Leptis_Magna_Theater_1.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1a/Leptis_magna_arch_septimius_severus.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/2/23/Leptis_magna_forum.jpg'
  ],
  sabratha: [
    'https://upload.wikimedia.org/wikipedia/commons/7/7b/Sabratha_theater_2008.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/91/Temple_of_Isis_Sabratha.jpg'
  ],
  cyrene: [
    'https://upload.wikimedia.org/wikipedia/commons/a/ae/Cyrene_temple_of_Zeus.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/91/Cyrene_sanctuary_apollo.jpg'
  ],
  ghadames: [
    'https://upload.wikimedia.org/wikipedia/commons/9/9b/Ghadames_roofs.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/30/Ghadam%C3%A8s_street.jpg'
  ],
  ubari: [
    'https://upload.wikimedia.org/wikipedia/commons/5/5a/Gaberoun_Lake_Ubari_Libya.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/7b/Mandara_Lake%2C_Libya.jpg'
  ],
  acacus: [
    'https://upload.wikimedia.org/wikipedia/commons/0/0c/Tadrart_Acacus_Libya.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/58/Acacus_rock_art_Libya.jpg'
  ],
  tripoli: [
    'https://upload.wikimedia.org/wikipedia/commons/6/60/Assai_al-Hamra_Tripoli_Libya.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e4/Tripoli_skyline.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/52/Marcus_Aurelius_Arch_Tripoli_Libya.jpg'
  ],
  benghazi: [
    'https://upload.wikimedia.org/wikipedia/commons/3/3c/Benghazi_lighthouse.jpg'
  ],
  // Food
  food: [
    'https://upload.wikimedia.org/wikipedia/commons/c/cc/Couscous_with_meat_and_vegetables.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/77/Bazin.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/a2/Shakshouka_pan.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/91/Magrood.jpg'
  ],
  // Hotels
  corinthia: ['https://upload.wikimedia.org/wikipedia/commons/8/87/Corinthia_Hotel_Tripoli.jpg'],
  tibesti: ['https://upload.wikimedia.org/wikipedia/commons/8/88/Tibesty_Hotel_Benghazi.jpg'],
  radisson: ['https://upload.wikimedia.org/wikipedia/commons/f/f6/Al-Mahary_Hotel_Tripoli.jpg']
};

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // A smart replacement: we split the file by objects (e.g. { id: '...', ... }) 
    // but since that's hard to parse with regex, we can just look for the Unsplash URLs
    // and replace them with a random image from the realLibyaImages map based on context.
    
    // Let's replace ALL unsplash URLs in the file with real wikimedia images.
    const unsplashRegex = /"https:\/\/images\.unsplash\.com\/photo-[^"]+"/g;
    
    content = content.replace(unsplashRegex, (match, offset, string) => {
        // Try to infer context by looking 500 characters around the match
        const contextStart = Math.max(0, offset - 300);
        const contextEnd = Math.min(string.length, offset + 300);
        const context = string.substring(contextStart, contextEnd).toLowerCase();
        
        let pool = [];
        
        if (context.includes('leptis') || context.includes('لبدة')) pool = realLibyaImages.leptis;
        else if (context.includes('sabratha') || context.includes('صبراتة')) pool = realLibyaImages.sabratha;
        else if (context.includes('cyrene') || context.includes('شحات') || context.includes('قورينا')) pool = realLibyaImages.cyrene;
        else if (context.includes('ghadames') || context.includes('غدامس')) pool = realLibyaImages.ghadames;
        else if (context.includes('ubari') || context.includes('أوباري') || context.includes('قبرعون')) pool = realLibyaImages.ubari;
        else if (context.includes('acacus') || context.includes('أكاكوس')) pool = realLibyaImages.acacus;
        else if (context.includes('benghazi') || context.includes('بنغازي')) pool = realLibyaImages.benghazi;
        else if (context.includes('corinthia') || context.includes('كورنثيا')) pool = realLibyaImages.corinthia;
        else if (context.includes('tibesti') || context.includes('تيبستي')) pool = realLibyaImages.tibesti;
        else if (context.includes('radisson') || context.includes('مهاري')) pool = realLibyaImages.radisson;
        else if (context.includes('tripoli') || context.includes('طرابلس') || context.includes('سرايا')) pool = realLibyaImages.tripoli;
        else if (context.includes('food') || context.includes('restaurant') || context.includes('مأكولات') || context.includes('مطعم')) pool = realLibyaImages.food;
        else if (context.includes('hotel') || context.includes('فندق')) pool = [...realLibyaImages.corinthia, ...realLibyaImages.radisson, ...realLibyaImages.tibesti];
        else {
            // fallback generic
            pool = [...realLibyaImages.tripoli, ...realLibyaImages.leptis];
        }
        
        const selected = pool[Math.floor(Math.random() * pool.length)];
        return `"${selected}"`;
    });
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
