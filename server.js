const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// 👉 YOUR APPS SCRIPT URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUQ23cZBnO1HsSgG1LgsvIxcBz3U-kIwoXIJpzVp4SxQvNPBVEXraPuSiNMIRAvOkZ_A/exec";

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
    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error("TASK FETCH ERROR:", err);
    res.status(500).send("Error fetching tasks");
  }
});

// ================= SUBMIT TASK =================
app.post('/submit', async (req, res) => {
  try {
    const { name, tasks } = req.body;

    await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: name,
        tasks
      })
    });

    res.send("Saved");
  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).send("Error submitting data");
  }
});

// ================= HOME =================
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});