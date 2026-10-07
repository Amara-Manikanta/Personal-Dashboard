const fs = require('fs');
const https = require('https');

const movies = [
    { title: "Iron Man", year: "2008" },
    { title: "The Incredible Hulk", year: "2008" },
    { title: "Iron Man 2", year: "2010" },
    { title: "Thor", year: "2011" },
    { title: "Captain America: The First Avenger", year: "2011" },
    { title: "The Avengers", year: "2012" },
    { title: "Iron Man 3", year: "2013" },
    { title: "Thor: The Dark World", year: "2013" },
    { title: "Captain America: The Winter Soldier", year: "2014" },
    { title: "Guardians of the Galaxy", year: "2014" },
    { title: "Avengers: Age of Ultron", year: "2015" },
    { title: "Ant-Man", year: "2015" },
    { title: "Captain America: Civil War", year: "2016" },
    { title: "Doctor Strange", year: "2016" },
    { title: "Guardians of the Galaxy Vol. 2", year: "2017" },
    { title: "Spider-Man: Homecoming", year: "2017" },
    { title: "Thor: Ragnarok", year: "2017" },
    { title: "Black Panther", year: "2018" },
    { title: "Avengers: Infinity War", year: "2018" },
    { title: "Ant-Man and the Wasp", year: "2018" },
    { title: "Captain Marvel", year: "2019" },
    { title: "Avengers: Endgame", year: "2019" },
    { title: "Spider-Man: Far From Home", year: "2019" },
    { title: "Black Widow", year: "2021" },
    { title: "Shang-Chi and the Legend of the Ten Rings", year: "2021" },
    { title: "Eternals", year: "2021" },
    { title: "Spider-Man: No Way Home", year: "2021" },
    { title: "Doctor Strange in the Multiverse of Madness", year: "2022" },
    { title: "Thor: Love and Thunder", year: "2022" },
    { title: "Black Panther: Wakanda Forever", year: "2022" },
    { title: "Ant-Man and the Wasp: Quantumania", year: "2023" },
    { title: "Guardians of the Galaxy Vol. 3", year: "2023" },
    { title: "The Marvels", year: "2023" },
    { title: "Deadpool & Wolverine", year: "2024" }
];

async function fetchWikiImage(title) {
    return new Promise((resolve) => {
        const queryTitle = encodeURIComponent(title + ' (film)');
        const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=500&titles=${queryTitle}`;
        https.get(url, { headers: { 'User-Agent': 'NodeJS/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pages[pageId] && pages[pageId].thumbnail) {
                        resolve(pages[pageId].thumbnail.source);
                    } else {
                        // Fallback without "(film)"
                        const fbUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=500&titles=${encodeURIComponent(title)}`;
                        https.get(fbUrl, { headers: { 'User-Agent': 'NodeJS/1.0' } }, (res2) => {
                            let data2 = '';
                            res2.on('data', chunk => data2 += chunk);
                            res2.on('end', () => {
                                try {
                                    const parsed2 = JSON.parse(data2);
                                    const pages2 = parsed2.query.pages;
                                    const pageId2 = Object.keys(pages2)[0];
                                    if (pages2[pageId2] && pages2[pageId2].thumbnail) {
                                        resolve(pages2[pageId2].thumbnail.source);
                                    } else {
                                        resolve(`https://via.placeholder.com/500x750?text=${encodeURIComponent(title)}`);
                                    }
                                } catch(e) {
                                    resolve(`https://via.placeholder.com/500x750?text=${encodeURIComponent(title)}`);
                                }
                            });
                        });
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
    for (let i = 0; i < movies.length; i++) {
        const m = movies[i];
        const imageUrl = await fetchWikiImage(m.title);
        const movieEntry = {
            id: Date.now().toString() + Math.floor(Math.random() * 1000),
            title: m.title,
            year: m.year,
            language: "English",
            status: "watched",
            rating: 5,
            notes: "Marvel Cinematic Universe",
            imageUrl: imageUrl,
            director: "Marvel Studios",
            genres: ["Action", "Sci-Fi", "Superhero"],
            addedAt: new Date().toISOString()
        };
        // Insert them at the top in reverse chronological order (so they end up chronological when unshifted one by one)
        // Wait, if we unshift in order, the last one ends up first.
        moviesData.unshift(movieEntry);
        console.log(`Added ${m.title}`);
        await new Promise(r => setTimeout(r, 500)); // sleep
    }
    fs.writeFileSync('./data/movies.json', JSON.stringify(moviesData, null, 2));
    console.log("Done");
}

run();
