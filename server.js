const express = require('express');
const bodyParser = require('body-parser');

// ======================================================
// FETCH — Render / Node compatible
// ======================================================
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;


// ======================================================
// GOOGLE APPS SCRIPT URL
// ======================================================

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbw1B1qSBKI2KcJtYIakcAOml4ahucgJyG0YJKq19T8__UEzuehu0g8yD_QMvxM7wK_uvw/exec';


// ======================================================
// LOGIN
// EMPLOYEE DATA COMES FROM GOOGLE SHEET
// ======================================================

app.post('/login', async (req, res) => {

  try {

    const id = String(req.body.id || '').trim();
    const password = String(req.body.password || '').trim();

    // ------------------------------------------
    // VALIDATE INPUT
    // ------------------------------------------

    if (!id || !password) {

      return res.json({
        success: false,
        message: 'Employee ID and password are required'
      });

    }


    // ------------------------------------------
    // GET EMPLOYEES FROM GOOGLE APPS SCRIPT
    // ------------------------------------------

    const response = await fetch(
      ${SCRIPT_URL}?type=employees
    );


    if (!response.ok) {

      throw new Error(
        Apps Script returned HTTP ${response.status}
      );

    }


    const text = await response.text();

    console.log('EMPLOYEES RAW RESPONSE:', text);


    let employees;

    try {

      employees = JSON.parse(text);

    } catch (parseError) {

      console.error(
        'EMPLOYEE JSON ERROR:',
        parseError
      );

      return res.status(500).json({
        success: false,
        message: 'Invalid response from Google Sheet'
      });

    }


    // ------------------------------------------
    // MAKE SURE EMPLOYEES IS AN ARRAY
    // ------------------------------------------

    if (!Array.isArray(employees)) {

      console.error(
        'EMPLOYEES IS NOT AN ARRAY:',
        employees
      );

      return res.status(500).json({
        success: false,
        message: 'Employee data is invalid'
      });

    }


    // ------------------------------------------
    // FIND EMPLOYEE
    // ------------------------------------------

    const user = employees.find(emp => {

      const sheetUsername =
        String(emp.username ?? '').trim().toLowerCase();

      const sheetPassword =
        String(emp.password ?? '').trim();

      const enteredUsername =
        id.toLowerCase();

      const enteredPassword =
        password;

      return (
        sheetUsername === enteredUsername &&
        sheetPassword === enteredPassword
      );

    });


    // ------------------------------------------
    // LOGIN SUCCESS
    // ------------------------------------------

    if (user) {

      console.log(
        LOGIN SUCCESS: ${user.username}
      );

      return res.json({

        success: true,

        user: {

          id: String(user.username).trim(),

          designation:
            String(user.designation ?? '').trim()

        }

      });

    }


    // ------------------------------------------
    // LOGIN FAILED
    // ------------------------------------------

    console.log(
      LOGIN FAILED: ${id}
    );

    return res.json({

      success: false,

      message: 'Invalid Employee ID or Password'

    });


  } catch (err) {

    console.error(
      'LOGIN ERROR:',
      err
    );

    return res.status(500).json({

      success: false,

      message: 'Unable to connect to employee database'

    });

  }

});


// ======================================================
// GET ASSIGNED TASKS
// ======================================================

app.get('/tasks/:name', async (req, res) => {

  try {

    const user =
      String(req.params.name || '').trim();


    const response = await fetch(

      ${SCRIPT_URL}?type=tasks&user=${encodeURIComponent(user)}

    );


    const text =
      await response.text();


    console.log(
      'TASK RAW:',
      text
    );


    const data =
      JSON.parse(text);


    res.json(data);


  } catch (err) {

    console.error(
      'TASK ERROR:',
      err
    );

    res.status(500).json({

      error: err.message

    });

  }

});


// ======================================================
// SUBMIT / ASSIGN / REMOVE
// ======================================================

app.post('/submit', async (req, res) => {

  try {

    const response =
      await fetch(SCRIPT_URL, {

        method: 'POST',

        headers: {

          'Content-Type':
            'application/json'

        },

        body:
          JSON.stringify(req.body)

      });


    const text =
      await response.text();


    console.log(
      'SUBMIT RAW:',
      text
    );


    res.json({

      success: true

    });


  } catch (err) {

    console.error(
      'SUBMIT ERROR:',
      err
    );

    res.status(500).json({

      error: 'Failed'

    });

  }

});


// ======================================================
// TASK SUMMARY
// ======================================================

app.get('/task-summary/:user', async (req, res) => {

  try {

    const user =
      String(req.params.user || '').trim();


    const url =
      ${SCRIPT_URL}?type=taskSummary&user=${encodeURIComponent(user)};


    console.log(
      'SUMMARY CALL:',
      url
    );


    const response =
      await fetch(url);


    const text =
      await response.text();


    console.log(
      'SUMMARY RAW:',
      text
    );


    const data =
      JSON.parse(text);


    res.json(data);


  } catch (err) {

    console.error(
      'SUMMARY ERROR:',
      err
    );

    res.status(500).json({

      error: 'Failed'

    });

  }

});


// ======================================================
// PROFILE
// ======================================================

app.get('/profile/:user', async (req, res) => {

  try {

    const user =
      String(req.params.user || '').trim();


    const response =
      await fetch(

        ${SCRIPT_URL}?type=profile&user=${encodeURIComponent(user)}

      );


    const text =
      await response.text();


    console.log(
      'PROFILE RAW:',
      text
    );


    const data =
      JSON.parse(text);


    res.json(data);


  } catch (err) {

    console.error(
      'PROFILE ERROR:',
      err
    );

    res.status(500).json({

      error: 'Failed'

    });

  }

});


// ======================================================
// HISTORY
// ======================================================

app.get('/history/:user', async (req, res) => {

  try {

    const user =
      String(req.params.user || '').trim();


    const response =
      await fetch(

        ${SCRIPT_URL}?type=taskHistory&user=${encodeURIComponent(user)}

      );


    const text =
      await response.text();


    console.log(
      'APPS SCRIPT HISTORY RESPONSE:'
    );

    console.log(text);


    res.send(text);


  } catch (err) {

    console.error(
      'HISTORY ERROR:',
      err
    );

    res.status(500).json({

      error: err.message,

      stack: err.stack

    });

  }

});


// ======================================================
// HOME
// ======================================================

app.get('/', (req, res) => {

  res.sendFile(
    __dirname + '/public/login.html'
  );

});


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});