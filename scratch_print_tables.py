import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('parsed_tables.json', 'r', encoding='utf-8') as f:
    tables = json.load(f)

for t in tables:
    print(f"\n========================================================")
    print(f"Table #{t['num']}: {t['name']} - {t['title']}")
    print(f"========================================================")
    for row in t['rows']:
        if len(row) >= 2 and ('اسم الحقل' in row[0] or 'Field' in row[0]):
            continue
        print("  |  ".join(row))
