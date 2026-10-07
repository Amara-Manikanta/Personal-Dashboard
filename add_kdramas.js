const fs = require('fs');
const https = require('https');

const titles = [
    { title: "Meteor Garden", year: "2018" },
    { title: "Descendants of the Sun", year: "2016" },
    { title: "Love O2O", year: "2016" },
    { title: "Life Is Beautiful", year: "1997" },
    { title: "Radio Romance", year: "2018" },
    { title: "The Legend of the Blue Sea", year: "2016" },
    { title: "A Love So Beautiful", year: "2017" }
];

async function fetchWikiImage(title) {
    return new Promise((resolve) => {
        let queryTitle = encodeURIComponent(title);
        if (title === "Meteor Garden" || title === "Life Is Beautiful") {
            queryTitle = encodeURIComponent(title + ' (TV series)');
        }
        
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
    for (let i = 0; i < titles.length; i++) {
        const m = titles[i];
        const imageUrl = await fetchWikiImage(m.title);
        const movieEntry = {
            id: Date.now().toString() + Math.floor(Math.random() * 1000),
            title: m.title,
            year: m.year,
            language: "Various",
            status: "watched",
            rating: 5,
            notes: "",
            imageUrl: imageUrl,
            director: "Unknown",
            genres: ["Romance", "Drama"],
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
