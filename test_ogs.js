const ogs = require('open-graph-scraper');
const options = { 
    url: 'https://maps.app.goo.gl/Zd7Ay4VK8w7Xk',
    fetchOptions: { headers: { 'user-agent': 'WhatsApp/2.21.12.21 A' } }
};
ogs(options)
  .then((data) => {
    console.log('result:', JSON.stringify(data.result, null, 2));
  })
  .catch((err) => {
    console.log('err:', err);
  });
