import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def find_types(filepath):
    print(f"\n================ FILE: {filepath} ================")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # find type ... = { ... } or interface ... { ... }
    types = re.findall(r'((?:type|interface)\s+([A-Za-z0-9_]+)\s*(?:=\s*)?\{[^\}]+\})', content)
    for full, name in types:
        print(f"--- TYPE: {name} ---")
        print(full.strip()[:600])

find_types('src/routes/transport.tsx')
find_types('src/routes/hotels.tsx')
find_types('src/components/HotelDetailsModal.tsx')
find_types('src/routes/restaurants.tsx')
find_types('src/routes/trips.tsx')
find_types('src/components/Modals.tsx')
