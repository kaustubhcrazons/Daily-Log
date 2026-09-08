const express = require("express");
const bodyParser = require("body-parser");

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(bodyParser.json());
app.use(express.static("public"));


// =====================================================
// SERVER CONFIG
// =====================================================

const PORT = process.env.PORT || 3000;

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxNSkZA-ZFT-obxcezIDAw-FEnbZivT7kZMklR-Q5qSSP472o1bUKpl_Efocy7qXJthDw/exec";


// =====================================================
// FETCH
// =====================================================

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));


// =====================================================
// LOGIN
// Google Sheet -> Apps Script -> Node Server
// =====================================================

app.post("/login", async (req, res) => {
  try {
    const id = String(req.body.id || "").trim();
    const password = String(req.body.password || "").trim();

    if (!id || !password) {
      return res.json({
        success: false,
        message: "Employee ID and password are required"
      });
    }

    console.log("LOGIN REQUEST:", id);

    const response = await fetch(
      SCRIPT_URL + "?type=employees"
    );

    const text = await response.text();

    console.log("EMPLOYEES RAW RESPONSE:");
    console.log(text);

    let employees;

    try {
      employees = JSON.parse(text);
    } catch (error) {
      console.error("EMPLOYEE JSON PARSE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Invalid response from Google Apps Script"
      });
    }

    if (!Array.isArray(employees)) {
      console.error("EMPLOYEES IS NOT AN ARRAY");

      return res.status(500).json({
        success: false,
        message: "Employee data is invalid"
      });
    }

    const user = employees.find((employee) => {

      const username = String(
        employee.username || ""
      )
        .trim()
        .toLowerCase();

      const employeePassword = String(
        employee.password || ""
      ).trim();

      return (
        username === id.toLowerCase() &&
        employeePassword === password
      );
    });


    // -------------------------------------------------
    // USER FOUND
    // -------------------------------------------------

    if (user) {

      console.log(
        "LOGIN SUCCESS:",
        user.username
      );

      return res.json({
        success: true,
        user: {
          id: user.username,
          designation: user.designation || ""
        }
      });
    }


    // -------------------------------------------------
    // USER NOT FOUND
    // -------------------------------------------------

    console.log(
      "LOGIN FAILED:",
      id
    );

    return res.json({
      success: false,
      message: "Invalid Employee ID or Password"
    });

  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Login server error"
    });
  }
});


// =====================================================
// GET ASSIGNED TASKS
// =====================================================

app.get("/tasks/:name", async (req, res) => {

  try {

    const user = req.params.name;

    const url =
      SCRIPT_URL +
      "?type=tasks&user=" +
      encodeURIComponent(user);

    console.log(
      "TASK CALL:",
      url
    );

    const response = await fetch(url);

    const text = await response.text();

    console.log(
      "TASK RAW RESPONSE:"
    );

    console.log(text);

    const data = JSON.parse(text);

    return res.json(data);

  } catch (error) {

    console.error(
      "TASK ERROR:",
      error
    );

    return res.status(500).json({
      error: "Failed to load tasks"
    });
  }
});


// =====================================================
// SUBMIT / ASSIGN / REMOVE TASK
// =====================================================

app.post("/submit", async (req, res) => {

  try {

    console.log(
      "SUBMIT REQUEST:",
      req.body
    );

    const response = await fetch(
      SCRIPT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(req.body)
      }
    );

    const text = await response.text();

    console.log(
      "SUBMIT RAW RESPONSE:"
    );

    console.log(text);

    return res.json({
      success: true
    });

  } catch (error) {

    console.error(
      "SUBMIT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Failed"
    });
  }
});


// =====================================================
// TASK SUMMARY
// =====================================================

app.get(
  "/task-summary/:user",
  async (req, res) => {

    try {

      const user = req.params.user;

      const url =
        SCRIPT_URL +
        "?type=taskSummary&user=" +
        encodeURIComponent(user);

      console.log(
        "SUMMARY CALL:",
        url
      );

      const response = await fetch(url);

      const text = await response.text();

      console.log(
        "SUMMARY RAW RESPONSE:"
      );

      console.log(text);

      const data = JSON.parse(text);

      return res.json(data);

    } catch (error) {

      console.error(
        "SUMMARY ERROR:",
        error
      );

      return res.status(500).json({
        error: "Failed to load task summary"
      });
    }
  }
);


// =====================================================
// PROFILE
// =====================================================

app.get(
  "/profile/:user",
  async (req, res) => {

    try {

      const user = req.params.user;

      const url =
        SCRIPT_URL +
        "?type=profile&user=" +
        encodeURIComponent(user);

      console.log(
        "PROFILE CALL:",
        url
      );

      const response = await fetch(url);

      const text = await response.text();

      console.log(
        "PROFILE RAW RESPONSE:"
      );

      console.log(text);

      const data = JSON.parse(text);

      return res.json(data);

    } catch (error) {

      console.error(
        "PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        error: "Failed to load profile"
      });
    }
  }
);


// =====================================================
// TASK HISTORY
// =====================================================

app.get(
  "/history/:user",
  async (req, res) => {

    try {

      const user = req.params.user;

      const url =
        SCRIPT_URL +
        "?type=taskHistory&user=" +
        encodeURIComponent(user);

      console.log(
        "HISTORY CALL:",
        url
      );

      const response = await fetch(url);

      const text = await response.text();

      console.log(
        "HISTORY RAW RESPONSE:"
      );

      console.log(text);

      return res.send(text);

    } catch (error) {

      console.error(
        "HISTORY ERROR:",
        error
      );

      return res.status(500).json({
        error: error.message
      });
    }
  }
);


// =====================================================
// HOME / LOGIN PAGE
// =====================================================

app.get("/", (req, res) => {

  res.sendFile(
    __dirname + "/public/login.html"
  );

});


// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  () => {

    console.log(
      "================================="
    );

    console.log(
      "SERVER RUNNING ON PORT:",
      PORT
    );

    console.log(
      "GOOGLE APPS SCRIPT CONNECTED"
    );

    console.log(
      "================================="
    );

  }
);