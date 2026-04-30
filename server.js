const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

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

app.post('/submit', (req, res) => {
  try {
    const { name, tasks } = req.body;

    const filePath = 'tasks.xlsx';
    let workbook;

    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
    } else {
      workbook = XLSX.utils.book_new();
    }

    let data = [];

    // If user sheet exists → load it
    if (workbook.Sheets[name]) {
      data = XLSX.utils.sheet_to_json(workbook.Sheets[name]);
    }

    const today = new Date().toISOString().split('T')[0];

    // Add all tasks
   tasks.forEach(t => {
  const totalMinutes = (t.hrs * 60) + t.mins;

  data.push({
    Date: today,
    Task: t.task,
    Hours: t.hrs,
    Minutes: t.mins,
    Total_Minutes: totalMinutes,
    Timestamp: new Date().toLocaleString()
  });
});
    const newSheet = XLSX.utils.json_to_sheet(data);

    workbook.Sheets[name] = newSheet;

    if (!workbook.SheetNames.includes(name)) {
      workbook.SheetNames.push(name);
    }

    XLSX.writeFile(workbook, filePath);

    res.send("Saved");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});
app.get('/admin-data', (req, res) => {
  try {
    const filePath = 'tasks.xlsx';

    if (!fs.existsSync(filePath)) {
      return res.json({});
    }

    const workbook = XLSX.readFile(filePath);
    let result = {};

    workbook.SheetNames.forEach(sheetName => {
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      result[sheetName] = data;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
app.post('/assign-task', (req, res) => {
  const { name, task } = req.body;

  let data = JSON.parse(fs.readFileSync('assignedTasks.json'));

  if (!data[name]) {
    data[name] = [];
  }

  data[name].push(task);

  fs.writeFileSync('assignedTasks.json', JSON.stringify(data, null, 2));

  res.send("Task assigned");
});
app.post('/remove-task', (req, res) => {
  const { name, task } = req.body;

  let data = JSON.parse(fs.readFileSync('assignedTasks.json'));

  data[name] = data[name].filter(t => t !== task);

  fs.writeFileSync('assignedTasks.json', JSON.stringify(data, null, 2));

  res.send("Task removed");
});
app.get('/tasks/:name', (req, res) => {
  const data = JSON.parse(fs.readFileSync('assignedTasks.json'));
  const name = req.params.name;

  res.json(data[name] || []);
});