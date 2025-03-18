const https = require('https');

const apiKey = 'napi_1rh3uer3z84dqkqznvbu3kj16ci132md8ybydnt3tvk4oq42is06djeb89gagmku';
const projectId = 'orange-art-41763467'; // 从上一步获取的项目ID

const options = {
  hostname: 'console.neon.tech',
  path: `/api/v2/projects/${projectId}/branches`,
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }
};

const req = https.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('分支信息:');
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log('无法解析JSON响应');
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`请求遇到问题: ${e.message}`);
});

req.end(); 