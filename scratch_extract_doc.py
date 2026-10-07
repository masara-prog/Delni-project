import zipfile
import xml.etree.ElementTree as ET
import os
import re

doc_path = "documentation (2).docx"

with zipfile.ZipFile(doc_path, 'r') as z:
    xml_content = z.read('word/document.xml')

root = ET.fromstring(xml_content)
namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

# Extract all paragraphs and tables
output_lines = []

for elem in root.iter():
    if elem.tag.endswith('}p'):
        text = "".join(t.text for t in elem.iter() if t.tag.endswith('}t') and t.text)
        if text.strip():
            output_lines.append(f"[P] {text.strip()}")
    elif elem.tag.endswith('}tbl'):
        output_lines.append("=== TABLE START ===")
        for row in elem.iter():
            if row.tag.endswith('}tr'):
                row_cells = []
                for cell in row.iter():
                    if cell.tag.endswith('}tc'):
                        cell_text = "".join(t.text for t in cell.iter() if t.tag.endswith('}t') and t.text)
                        row_cells.append(cell_text.strip())
                if row_cells:
                    output_lines.append(" | ".join(row_cells))
        output_lines.append("=== TABLE END ===")

with open("doc_text.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

print(f"Extracted {len(output_lines)} lines.")
