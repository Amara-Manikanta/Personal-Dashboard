import re

file_path = '/Users/manikantaamara/Desktop/Antigravity/Novels_dashboard/src/data.js'

with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
counter = 1
id_pattern = re.compile(r"^(\s*)id: (\d+),")

for line in lines:
    match = id_pattern.match(line)
    if match:
        indentation = match.group(1)
        new_line = f"{indentation}id: {counter},\n"
        new_lines.append(new_line)
        counter += 1
    else:
        new_lines.append(line)

with open(file_path, 'w') as f:
    f.writelines(new_lines)

print(f"Updates completed. Last ID assigned: {counter - 1}")
