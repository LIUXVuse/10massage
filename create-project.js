const https = require('https');

const apiKey = 'napi_1rh3uer3z84dqkqznvbu3kj16ci132md8ybydnt3tvk4oq42is06djeb89gagmku';

const data = JSON.stringify({
  project: {
    name: '10massage-db'
  }
});

const options = {
  hostname: 'console.neon.tech',
  path: '/api/v2/projects',
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('响应数据:');
    try {
      const parsedData = JSON.parse(responseData);
      console.log(JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log('无法解析JSON响应');
      console.log(responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`请求遇到问题: ${e.message}`);
});

req.write(data);
req.end(); 