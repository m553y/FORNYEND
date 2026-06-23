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

async function test() {
  console.log("Registering user...");
  let res = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    username: "testuser99",
    email: "testuser99@cargo.local",
    password: "Test12345!",
    role: "seller"
  });
  console.log("Register:", res.status, res.data);
  let token = null;
  try {
    const parsed = JSON.parse(res.data);
    token = parsed.token || parsed.access_token;
  } catch(e) {}

  if (!token) {
    console.log("Logging in...");
    res = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: "testuser99@cargo.local",
      password: "Test12345!"
    });
    console.log("Login:", res.status, res.data);
    try {
      const parsed = JSON.parse(res.data);
      token = parsed.token || parsed.access_token;
    } catch(e) {}
  }

  console.log("Token:", token);
  
  console.log("Fetching products with token...");
  res = await request('/api/product', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log("Products (with token):", res.status, res.data.substring(0, 200));

  console.log("Fetching products without token...");
  res = await request('/api/product', {
    method: 'GET'
  });
  console.log("Products (without token):", res.status, res.data.substring(0, 200));
}

test();
