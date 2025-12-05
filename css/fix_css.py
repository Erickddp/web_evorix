
import os

file_path = r"c:\Users\Erick D\Desktop\EVORIX\css\styles.css"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixed_lines = []
corruption_started = False

for i, line in enumerate(lines):
    # Heuristic: if line looks like " / *   = = =", it's the start of corruption
    # The line 1134 in previous view was "/ *   = = = ..."
    # Let's look for the specific header "5 .   S E R V I C E S"
    
    if not corruption_started:
        # Check if this line is corrupted.
        # Corrupted lines seem to have spaces between every char.
        # A good check is if it has a lot of spaces.
        # Or specific check:
        if " / *   = = =" in line or ". s e r v i c e s" in line:
            corruption_started = True
            print(f"Corruption detected at line {i+1}")
    
    if corruption_started:
        # Apply fix: take every 2nd character?
        # But wait, line endings?
        # If line ends with \n, and it's spaced, it might be \n \n?
        # Let's strip the newline, apply fix, then add newline.
        
        content = line.rstrip('\n')
        # If the line is empty, it might be just spaces?
        if not content:
            fixed_lines.append(line)
            continue
            
        # Try taking every 2nd char.
        # We need to be careful about alignment.
        # If the line starts with a space that is part of the "spacing", we skip it?
        # Or is it `char` `space` `char` `space`?
        # Let's try `content[::2]` and `content[1::2]` and see which one looks like valid CSS.
        
        candidate1 = content[::2]
        candidate2 = content[1::2]
        
        # Simple heuristic: CSS usually has `{`, `}`, `:`, `;`, `.`, `#`, letters.
        # If candidate1 has these and candidate2 is all spaces, then candidate1 is it.
        
        # Actually, looking at ". s e r v i c e s", the chars are at 0, 2, 4...
        # So content[::2] should be it.
        
        fixed_line = content[::2]
        fixed_lines.append(fixed_line + '\n')
    else:
        fixed_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print("Done.")
