const express = require("express");
const employeeRoutes = require("./routes/api/employee");

const app = express();
app.use(express.json());


var cors = require("cors");

const corsOptions = {
  origin: [
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));


// Mount employee routes
app.use("/api/employee", employeeRoutes);

app.listen(5000, () => {
  console.log("Express API running on port 5000");
});