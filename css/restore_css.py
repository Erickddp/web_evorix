
import os
import re

backup_path = r"c:\Users\Erick D\Desktop\EVORIX\css\styles.css.bak"
output_path = r"c:\Users\Erick D\Desktop\EVORIX\css\styles_restored.css"

with open(backup_path, 'rb') as f:
    raw_data = f.read()

end_marker = b'/* Reserve space for typewriter */'
match = re.search(re.escape(end_marker), raw_data)

if match:
    brace_pos = raw_data.find(b'}', match.end())
    if brace_pos != -1:
        split_point = brace_pos + 1
        while split_point < len(raw_data) and raw_data[split_point] in (13, 10):
            split_point += 1
            
        print(f"Split point found at {split_point}")
        
        part1 = raw_data[:split_point]
        part2 = raw_data[split_point:]
        
        text1 = part1.decode('utf-8')
        
        # Ensure even length for UTF-16
        if len(part2) % 2 != 0:
            print(f"Part 2 length {len(part2)} is odd. Dropping last byte.")
            part2 = part2[:-1]
            
        try:
            text2 = part2.decode('utf-16le')
            print("Decoded part 2 successfully.")
        except UnicodeDecodeError as e:
            print(f"Error decoding part 2: {e}")
            text2 = part2.decode('utf-16le', errors='ignore')
        
        full_text = text1 + "\n" + text2
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
            
        print("Restored successfully.")
    else:
        print("Could not find closing brace.")
else:
    print("Could not find end marker.")
