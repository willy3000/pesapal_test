const express = require("express");
const { stat } = require("fs");
const router = express.Router();
const net = require("net");
const { v4: uuidv4 } = require("uuid");

// Python RDBMS TCP host/port
const DB_HOST = "127.0.0.1";
const DB_PORT = 9000;


const EXISTING_TABLES = new Set();

function sendSQL(sql) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Sending SQL: ${sql}`);
      const response = await sendRawSQL(sql);
      resolve(response);
    } catch (err) {
      reject(err);
    }
  });
}

// send sql function
function sendRawSQL(sql) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(DB_PORT, DB_HOST, () => {
      client.write(JSON.stringify({ sql }));
    });

    client.on("data", (data) => {
      const response = JSON.parse(data.toString());
      resolve(response);
      client.destroy();
    });

    client.on("error", (err) => reject(err));
  });
}

//add employee
router.post("/addEmployee", async (req, res) => {
  const employeeDetails = {
    id: uuidv4(),
    // id: "9",
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    department: req.body.department,
    status: req.body.status,
  };

  console.log("Employee Details:", employeeDetails);

  const sql = `INSERT INTO employees (id, name, email, department, role, status) VALUES ('${employeeDetails.id}', '${employeeDetails.name}', '${employeeDetails.email}', '${employeeDetails.department}', '${employeeDetails.role}', '${employeeDetails.status}')`;
  console.log("SQL:", sql);

  try {
    const response = await sendSQL(sql);
    console.log("response", response);
    res.json({
      success: true,
      message: "Employee Added",
      dbResponse: response,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get All Employees
router.get("/getAllEmployees", async (req, res) => {
  const sql = `SELECT * FROM employees`;
  try {
    const response = await sendSQL(sql);
    res.json({ success: true, dbResponse: response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Employee by ID
router.get("/getEmployee/:employeeId", async (req, res) => {
  const sql = `SELECT * FROM employees WHERE id = '${req.params.employeeId}'`;
  try {
    const response = await sendSQL(sql);
    res.json({ success: true, dbResponse: response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Employee
router.put("/updateEmployee/:employeeId", async (req, res) => {
  const { name, email, department, role, status } = req.body;
  const sql = `UPDATE employees SET name = '${name}', email = '${email}', department = '${department}', role = '${role}', status = '${status}' WHERE id = '${req.params.employeeId}'`;
  console.log("SQL:", sql);
  try {
    const response = await sendSQL(sql);
    res.json({ success: true, dbResponse: response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Employee
router.delete("/deleteEmployee/:employeeId", async (req, res) => {
  const sql = `DELETE FROM employees WHERE id = '${req.params.employeeId}'`;
  try {
    const response = await sendSQL(sql);
    res.json({ success: true, dbResponse: response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
