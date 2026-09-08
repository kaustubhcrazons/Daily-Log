const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// Google Apps Script Web App URL
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzRDxJ5hVkxQ_GEah1K3FzRvjFNg0KVIgAsvTYmPBTouNYemwZ6ZqzfTT4j05QEY59SQg/exec";

// ======================================================
// FETCH
// ======================================================

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));


// ======================================================
// LOGIN
// ======================================================

app.post("/login", async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.json({
        success: false,
        message: "Employee ID and password are required"
      });
    }

    const response = await fetch(
      ${SCRIPT_URL}?type=employees
    );

    const text = await response.text();

    console.log("EMPLOYEES RESPONSE:");
    console.log(text);

    let employees;

    try {
      employees = JSON.parse(text);
    } catch (parseError) {
      console.error("EMPLOYEES JSON ERROR:", parseError);

      return res.status(500).json({
        success: false,
        message: "Invalid response from Google Apps Script"
      });
    }

    const loginId = String(id).trim().toLowerCase();
    const loginPassword = String(password).trim();

    const user = employees.find((emp) => {
      const username = String(emp.username || "")
        .trim()
        .toLowerCase();

      const empPassword = String(emp.password || "").trim();

      return (
        username === loginId &&
        empPassword === loginPassword
      );
    });

    if (!user) {
      console.log("LOGIN FAILED:", id);

      return res.json({
        success: false,
        message: "Invalid Employee ID or Password"
      });
    }

    console.log("LOGIN SUCCESS:", user.username);

    return res.json({
      success: true,
      user: {
        id: user.username,
        designation: user.designation || ""
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login server error"
    });
  }
});


// ======================================================
// GET ASSIGNED TASKS
// ======================================================

app.get("/tasks/:name", async (req, res) => {
  try {
    const user = req.params.name;

    const url =
      ${SCRIPT_URL}?type=tasks&user=${encodeURIComponent(user)};

    console.log("TASK CALL:", url);

    const response = await fetch(url);

    const text = await response.text();

    console.log("TASK RAW:", text);

    const data = JSON.parse(text);

    res.json(data);

  } catch (error) {
    console.error("TASK ERROR:", error);

    res.status(500).json({
      error: "Failed to load tasks"
    });
  }
});


// ======================================================
// SUBMIT / ASSIGN / REMOVE
// ======================================================

app.post("/submit", async (req, res) => {
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

    res.json({
      success: true
    });

  } catch (error) {
    console.error("SUBMIT ERROR:", error);

    res.status(500).json({
      success: false,
      error: "Failed"
    });
  }
});


// ======================================================
// TASK SUMMARY
// ======================================================

app.get("/task-summary/:user", async (req, res) => {
  try {
    const user = req.params.user;

    const url =
      ${SCRIPT_URL}?type=taskSummary&user=${encodeURIComponent(user)};

    console.log("SUMMARY CALL:", url);

    const response = await fetch(url);

    const text = await response.text();

    console.log("SUMMARY RAW:", text);

    const data = JSON.parse(text);

    res.json(data);

  } catch (error) {
    console.error("SUMMARY ERROR:", error);

    res.status(500).json({
      error: "Failed"
    });
  }
});


// ======================================================
// PROFILE
// ======================================================

app.get("/profile/:user", async (req, res) => {
  try {
    const user = req.params.user;

    const url =
      ${SCRIPT_URL}?type=profile&user=${encodeURIComponent(user)};

    console.log("PROFILE CALL:", url);

    const response = await fetch(url);

    const text = await response.text();

    console.log("PROFILE RAW:", text);

    const data = JSON.parse(text);

    res.json(data);

  } catch (error) {
    console.error("PROFILE ERROR:", error);

    res.status(500).json({
      error: "Failed"
    });
  }
});


// ======================================================
// HISTORY
// ======================================================

app.get("/history/:user", async (req, res) => {
  try {
    const user = req.params.user;

    const url =
      ${SCRIPT_URL}?type=taskHistory&user=${encodeURIComponent(user)};

    console.log("HISTORY CALL:", url);

    const response = await fetch(url);

    const text = await response.text();

    console.log("HISTORY RAW:", text);

    res.send(text);

  } catch (error) {
    console.error("HISTORY ERROR:", error);

    res.status(500).json({
      error: error.message
    });
  }
});


// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});