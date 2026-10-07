const fs = require('fs');
const https = require('https');

const movies = [
    { title: "Transformers", year: "2007" },
    { title: "Transformers: Revenge of the Fallen", year: "2009" },
    { title: "Transformers: Dark of the Moon", year: "2011" },
    { title: "Transformers: Age of Extinction", year: "2014" },
    { title: "Transformers: The Last Knight", year: "2017" },
    { title: "Bumblebee", year: "2018" },
    { title: "Transformers: Rise of the Beasts", year: "2023" },
    
    { title: "Cars", year: "2006" },
    { title: "Cars 2", year: "2011" },
    { title: "Cars 3", year: "2017" },
    
    { title: "Journey to the Center of the Earth", year: "2008" },
    { title: "Journey 2: The Mysterious Island", year: "2012" },
    
    { title: "Indiana Jones and the Raiders of the Lost Ark", year: "1981" },
    { title: "Indiana Jones and the Temple of Doom", year: "1984" },
    { title: "Indiana Jones and the Last Crusade", year: "1989" },
    { title: "Indiana Jones and the Kingdom of the Crystal Skull", year: "2008" },
    { title: "Indiana Jones and the Dial of Destiny", year: "2023" }
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
            notes: "Marathon",
            imageUrl: imageUrl,
            director: "Unknown",
            genres: ["Action", "Adventure"],
            addedAt: new Date().toISOString()
        };
        moviesData.unshift(movieEntry);
        console.log(`Added ${m.title}`);
        await new Promise(r => setTimeout(r, 400)); // sleep
    }
    fs.writeFileSync('./data/movies.json', JSON.stringify(moviesData, null, 2));
    console.log("Done");
}

run();
