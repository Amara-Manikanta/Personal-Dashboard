const fs = require('fs');
const https = require('https');

const movies = [
    { title: "Harry Potter and the Philosopher's Stone", year: "2001", director: "Chris Columbus" },
    { title: "Harry Potter and the Chamber of Secrets", year: "2002", director: "Chris Columbus" },
    { title: "Harry Potter and the Prisoner of Azkaban", year: "2004", director: "Alfonso Cuarón" },
    { title: "Harry Potter and the Goblet of Fire", year: "2005", director: "Mike Newell" },
    { title: "Harry Potter and the Order of the Phoenix", year: "2007", director: "David Yates" },
    { title: "Harry Potter and the Half-Blood Prince", year: "2009", director: "David Yates" },
    { title: "Harry Potter and the Deathly Hallows – Part 1", year: "2010", director: "David Yates" },
    { title: "Harry Potter and the Deathly Hallows – Part 2", year: "2011", director: "David Yates" },
    { title: "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe", year: "2005", director: "Andrew Adamson" },
    { title: "The Chronicles of Narnia: Prince Caspian", year: "2008", director: "Andrew Adamson" },
    { title: "The Chronicles of Narnia: The Voyage of the Dawn Treader", year: "2010", director: "Michael Apted" }
];

async function fetchWikiImage(title) {
    return new Promise((resolve) => {
        const queryTitle = encodeURIComponent(title.includes('Harry') ? title + ' (film)' : title);
        const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=500&titles=${queryTitle}`;
        https.get(url, { headers: { 'User-Agent': 'NodeJS/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pages[pageId].thumbnail) {
                        resolve(pages[pageId].thumbnail.source);
                    } else {
                        resolve(`https://via.placeholder.com/500x750?text=${encodeURIComponent(title)}`);
                    }
                } catch (e) {
                    resolve(`https://via.placeholder.com/500x750?text=${encodeURIComponent(title)}`);
                }
            });
        }).on('error', () => {
            resolve(`https://via.placeholder.com/500x750?text=${encodeURIComponent(title)}`);
        });
    });
}

async function run() {
    const moviesData = require('./data/movies.json');
    for (const m of movies) {
        const imageUrl = await fetchWikiImage(m.title);
        const movieEntry = {
            id: Date.now().toString() + Math.floor(Math.random() * 1000),
            title: m.title,
            year: m.year,
            language: "English",
            status: "watched",
            rating: 5,
            notes: "Series marathon",
            imageUrl: imageUrl,
            director: m.director,
            genres: ["Fantasy", "Adventure"],
            addedAt: new Date().toISOString()
        };
        moviesData.unshift(movieEntry);
        console.log(`Added ${m.title}`);
        await new Promise(r => setTimeout(r, 1000)); // sleep
    }
    fs.writeFileSync('./data/movies.json', JSON.stringify(moviesData, null, 2));
    console.log("Done");
}

run();
