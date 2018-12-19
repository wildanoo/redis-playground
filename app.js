const express = require('express');
const responseTime = require('response-time');
const requests = require('request-promise');
const redis = require('redis');

const app = express();
const client = redis.createClient();

client.auth('password');

client.on('error', (err) => {
  console.log('Error ' + err);
});

app.use(responseTime());

app.get('/api/posts', async (req, res) => {

  return client.get(`POST:LIST`, async (err, result) => {
    if (result) {
      const resultJSON = JSON.parse(result);
      return res.status(200).json(resultJSON);
    } else {
      const url = 'https://jsonplaceholder.typicode.com/posts';

      const options = {
        uri: url,
        json: true
      };

      const result = await requests(options);
      client.setex(`POST:LIST`, 15, JSON.stringify({ source: 'Redis cache', result, }));
      return res.status(200).json(result);
    }
  });
});

app.get('/api/comments', async (req, res) => {
  const url = 'https://jsonplaceholder.typicode.com/comments';

  const options = {
    uri: url,
    json: true
  };

  const result = await requests(options);
  return res.status(200).json(result);
})

app.listen(3000, () => {
  console.log('Server listening to port: ', 3000);
});
