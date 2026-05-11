const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// ✅ FIX: fetch for all environments (Render safe)
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// 🔗 YOUR APPS SCRIPT URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6GuQiW73J18XsFGnOuhNYcnFjOL1QIQOZ6Zzqzr6r-u5Tw-nDndN4G80t8nhH-a8iig/exec";

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

// ================= GET ASSIGNED TASKS =================
app.get('/tasks/:name', async (req, res) => {
  try {
    const user = req.params.name;

    const url = `${SCRIPT_URL}?type=tasks&user=${user}`;
    console.log("TASK CALL:", url);

    const response = await fetch(url);
    const text = await response.text();

    console.log("TASK RAW:", text);

    const data = JSON.parse(text);

    res.json(data);

  } catch (err) {
    console.error("TASK ERROR:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ================= SUBMIT / ASSIGN / REMOVE =================
app.post('/submit', async (req, res) => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();

    console.log("SUBMIT RAW:", text);

    res.json({ success: true });

  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({ error: "Failed" });
  }
});

// ================= TASK SUMMARY =================
app.get('/task-summary/:user', async (req, res) => {
  try {
    const user = req.params.user;

    const url = `${SCRIPT_URL}?type=taskSummary&user=${user}`;
    console.log("SUMMARY CALL:", url);

    const response = await fetch(url);
    const text = await response.text();

    console.log("SUMMARY RAW:", text);

    const data = JSON.parse(text);

    res.json(data);

  } catch (err) {
    console.error("SUMMARY ERROR:", err);
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
//
// 🔹 SHOW EMPLOYEE LIST
//
function showEmployees() {

  const section = document.getElementById("employeeSection");

  section.style.display = "block";

  const employees = ["emp1", "emp2"];

  const list = document.getElementById("employeeList");

  list.innerHTML = employees.map(emp => `
    <div 
      onclick="selectEmployee('${emp}')"
      style="
        padding:12px;
        margin:8px 0;
        background:#eef2ff;
        border-radius:8px;
        cursor:pointer;
      "
    >
      ${emp}
    </div>
  `).join("");
}

//
// 🔹 SELECT EMPLOYEE
//
function selectEmployee(emp) {

  // update dropdown
  document.getElementById("user").value = emp;

  // reload data
  loadAssigned();
}

//
// 🔹 DASHBOARD VIEW
//
function showDashboard() {
  document.getElementById("employeeSection").style.display = "none";
}