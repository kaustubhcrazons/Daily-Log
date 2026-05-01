const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// 🔗 YOUR APPS SCRIPT URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwvUQfET3_1fd7_LsYwlKFTzTwXuFjxjpzgqEcx9zusf1_0kHgi4cXnMnkGDTVuAVus6Q/exec";

// ================= LOGIN =================
const users = JSON.parse(fs.readFileSync('users.json'));

app.post('/login', (req, res) => {
  const { id, password } = req.body;

  const user = users.find(u => u.id === id && u.password === password);

  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false });
  }
});

// ================= GET TASKS =================
app.get('/tasks/:name', async (req, res) => {
  try {
    const user = req.params.name;

    const response = await fetch(`${SCRIPT_URL}?type=tasks&user=${user}`);
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch {
      console.error("INVALID RESPONSE:", text);
      res.status(500).json({ error: "Invalid response" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ================= SUBMIT / ASSIGN / REMOVE =================
app.post('/submit', async (req, res) => {
  try {
    const body = req.body;

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();

    console.log("APPS SCRIPT RESPONSE:", text); // 👈 IMPORTANT

    res.json({ success: true });

  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({ error: "Failed" });
  }
});
// ================= HOME =================
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// ================= START =================
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});