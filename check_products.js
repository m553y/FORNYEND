const http = require('https');

function request(path, options, bodyData) {
  return new Promise((resolve, reject) => {
    const req = http.request(`https://cargo-project-production.up.railway.app${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    if (bodyData) {
      req.write(JSON.stringify(bodyData));
    }
    req.end();
  });
}

async function checkProducts() {
  // Login first to get token
  let res = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: "testuser99@cargo.local",
    password: "Test12345!"
  });
  
  let token = null;
  try {
    const parsed = JSON.parse(res.data);
    token = parsed.token || parsed.access_token || parsed.data?.token || parsed.user?.token;
  } catch(e) {}
  
  if (!token) {
    console.log("Could not login. Response:", res.data);
    return;
  }
  
  res = await request('/api/product', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log("Products status:", res.status);
  console.log("Products response:", res.data);
}

checkProducts();
