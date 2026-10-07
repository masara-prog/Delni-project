import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('parsed_tables.json', 'r', encoding='utf-8') as f:
    tables = json.load(f)

with open('tables_detailed_summary.txt', 'w', encoding='utf-8') as out:
    for t in tables:
        out.write(f"\n========================================================\n")
        out.write(f"Table #{t['num']}: {t['name']} - {t['title']}\n")
        out.write(f"========================================================\n")
        for row in t['rows']:
            if len(row) >= 2 and ('اسم الحقل' in row[0] or 'Field' in row[0]):
                continue
            out.write("  |  ".join(row) + "\n")

print("Wrote detailed summary to tables_detailed_summary.txt")
