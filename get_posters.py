import urllib.request
import json
import re

movies = [
    ("Harry Potter and the Sorcerer's Stone", "2001", "Chris Columbus", "Fantasy"),
    ("Harry Potter and the Chamber of Secrets", "2002", "Chris Columbus", "Fantasy"),
    ("Harry Potter and the Prisoner of Azkaban", "2004", "Alfonso Cuarón", "Fantasy"),
    ("Harry Potter and the Goblet of Fire", "2005", "Mike Newell", "Fantasy"),
    ("Harry Potter and the Order of the Phoenix", "2007", "David Yates", "Fantasy"),
    ("Harry Potter and the Half-Blood Prince", "2009", "David Yates", "Fantasy"),
    ("Harry Potter and the Deathly Hallows: Part 1", "2010", "David Yates", "Fantasy"),
    ("Harry Potter and the Deathly Hallows: Part 2", "2011", "David Yates", "Fantasy"),
    ("The Chronicles of Narnia: The Lion, the Witch and the Wardrobe", "2005", "Andrew Adamson", "Fantasy"),
    ("The Chronicles of Narnia: Prince Caspian", "2008", "Andrew Adamson", "Fantasy"),
    ("The Chronicles of Narnia: The Voyage of the Dawn Treader", "2010", "Michael Apted", "Fantasy")
]

results = []
for title, year, director, genre in movies:
    query = urllib.parse.quote(f"{title} {year} poster")
    url = f"https://html.duckduckgo.com/html/?q={query}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        # duckduckgo doesn't show images easily in html version. Let's just use imdb search.
    except Exception:
        pass

