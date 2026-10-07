const fs = require('fs');
const https = require('https');

const movies = [
    { title: "Ice Age", year: "2002" },
    { title: "Ice Age: The Meltdown", year: "2006" },
    { title: "Ice Age: Dawn of the Dinosaurs", year: "2009" },
    { title: "Ice Age: Continental Drift", year: "2012" },
    { title: "Ice Age: Collision Course", year: "2016" },
    
    { title: "How to Train Your Dragon", year: "2010" },
    { title: "How to Train Your Dragon 2", year: "2014" },
    { title: "How to Train Your Dragon: The Hidden World", year: "2019" },
    
    { title: "Despicable Me", year: "2010" },
    { title: "Despicable Me 2", year: "2013" },
    { title: "Minions", year: "2015" },
    { title: "Despicable Me 3", year: "2017" },
    { title: "Minions: The Rise of Gru", year: "2022" },
    { title: "Despicable Me 4", year: "2024" },
    
    { title: "Mission: Impossible", year: "1996" },
    { title: "Mission: Impossible 2", year: "2000" },
    { title: "Mission: Impossible III", year: "2006" },
    { title: "Mission: Impossible - Ghost Protocol", year: "2011" },
    { title: "Mission: Impossible - Rogue Nation", year: "2015" },
    { title: "Mission: Impossible - Fallout", year: "2018" },
    { title: "Mission: Impossible - Dead Reckoning Part One", year: "2023" },
    
    { title: "Men in Black", year: "1997" },
    { title: "Men in Black II", year: "2002" },
    { title: "Men in Black 3", year: "2012" },
    { title: "Men in Black: International", year: "2019" }
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
