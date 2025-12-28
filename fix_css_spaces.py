import re

file_path = 'src/NovelsDashboard.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Pattern to find CSS properties/values with spaces around hyphens
# e.g., "margin - top", "grid - template - columns", "max - width"
# We'll look for [a-z] - [a-z] patterns and blindly fix them? 
# Might be risky for JS subtraction.
# But inside this file, JS subtraction usually has spaces like "a - b".
# CSS props are usually specific.
# Let's target specific CSS keywords or use a safer regex.

# Safer approach: Target known CSS property parts
known_words = [
    'margin', 'padding', 'font', 'border', 'background', 'grid', 'flex', 'text', 'max', 'min', 'justify', 'align', 'template', 'column', 'columns', 'bottom', 'top', 'left', 'right', 'width', 'height', 'color', 'radius', 'wrap', 'auto', 'fill', 'order'
]

def fix_hyphens(match):
    return match.group(0).replace(' - ', '-')

# Replacements
# We want to match "word - word" where both words are in our known list, or one of them is.
# Actually, let's just specific strict patterns found in the view_file output.

patterns = [
    r'padding - top',
    r'margin - bottom',
    r'margin - top',
    r'font - size',
    r'font - weight',
    r'border - radius',
    r'grid - template - columns',
    r'justify - content',
    r'align - items',
    r'flex - wrap',
    r'flex - direction',
    r'max - width',
    r'min - width',
    r'text - align',
    r'border - left',
    r'border - right',
    r'background - color',
    r'space - between',
    r'flex - end',
    r'auto - fill',
    r'border - color',
    r'white - space',
    r'letter - spacing',
    r'text - transform',
    r'bg - surface',
    r'bg - app',
    r'text - primary',
    r'text - secondary',
    r'text - muted'
]

new_content = content
for p in patterns:
    # Handle multiple hyphens e.g. grid - template - columns
    # We replace ' - ' with '-'
    # Regex matching current pattern with spaces
    # Note: re.sub will easier.
    
    # Construct the spaced version from the clean version?
    # No, I have the spaced versions in the list above?
    # Wait, the list above has spaces. I want to replace those spaces with nothing.
    
    clean_p = p.replace(' - ', '-')
    new_content = new_content.replace(p, clean_p)

# Extra pass for things I might have missed, or double spaces
new_content = new_content.replace('max - width', 'max-width')
new_content = new_content.replace('grid - template - columns', 'grid-template-columns')

with open(file_path, 'w') as f:
    f.write(new_content)

print("Fixed CSS spaces.")
