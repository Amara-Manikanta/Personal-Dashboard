import re

file_path = 'src/NovelsDashboard.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# We need to find the content inside <style>{}</style> and apply fixes there.
# Use regex to find the block.
# Assuming there is one main block.

style_pattern = re.compile(r'(<style>\{`)(.*?)(`\}</style>)', re.DOTALL)

def fix_css_content(match):
    before = match.group(1)
    css_text = match.group(2)
    after = match.group(3)
    
    # 1. Fix selectors: spaces around hyphens in class names
    # e.g. .app - header -> .app-header
    # We can just aggressively replace " - " with "-" inside the CSS block.
    # Is there any valid use of " - " in CSS?
    # Calc(100% - 20px) -> spaces required around operator.
    # But usually calc uses spaces. " - " is needed there.
    # Class names: "word - word" -> invalid, user meant "word-word"
    # Properties: "margin - top" -> invalid, user meant "margin-top"
    # Values: "space - between" -> invalid, user meant "space-between"
    # Units: "100 %" -> invalid, "100%"
    # Z-index: "z - index" -> "z-index"
    
    # Let's clean it up line by line or token by token.
    
    # We will replace " - " with "-"
    # But we must be careful about calc(), though looking at the file:
    # width: 100 %; (invalid space in unit)
    # top: 50 %; (invalid space in unit)
    # transform: translateY(-50 %); (invalid space in unit)
    
    # Step A: Fix units " %" -> "%"
    css_text = css_text.replace(' %', '%')
    
    # Step B: Fix " - " -> "-"
    # This might break calc(100% - 20px) if we change it to calc(100%-20px) which MIGHT correspond to 80%? 
    # Actually in calc, " - " is minus, "-" is negative number. "100%-20px" is interpreted as "100%" and "-20px".... wait.
    # MDN: "The + and - operators must be surrounded by whitespace."
    # So "100% - 20px" IS correct. "100%-20px" is parsed as 100% and a negative length.
    
    # Does this file use calc?
    # Scanning previous view_file... no calc usage visible.
    # Common usages:
    # .app - header (Selection) -> Fix
    # background - color (Property) -> Fix
    # backdrop - filter (Property) -> Fix
    # border - bottom (Property) -> Fix
    # z - index (Property) -> Fix
    # align - items (Property) -> Fix
    # header - container (Selector) -> Fix
    # logo - icon (Selector) -> Fix
    # search - bar (Selector) -> Fix
    # text - muted (Value/Selector) -> Fix
    
    # It seems SAFE to replace " - " with "-" in this file context.
    css_text = css_text.replace(' - ', '-')

    # Step C: Fix " -word" -> "-word"
    # Example: .export -btn -> .export-btn
    # We must NOT replace " -10px" (negative number)
    css_text = re.sub(r' -([a-zA-Z])', r'-\1', css_text)
    
    return before + css_text + after

new_content = style_pattern.sub(fix_css_content, content)

with open(file_path, 'w') as f:
    f.write(new_content)

print("Fixed CSS selectors and units in NovelsDashboard.jsx")
