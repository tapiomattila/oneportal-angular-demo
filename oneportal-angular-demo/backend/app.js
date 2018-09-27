const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const morgan = require("morgan");

var conf;

try {
  // conf = require("/etc/oneportal-angular-demo/oneportal-ng-demo-conf.json");
  conf = require("./conf.json");
} catch (error) {
  console.log("conf not found");
  console.log(error);
}

const app = express();

const tokenRoutes = require("./routes/token");
const authRoutes = require("./routes/auth");

if (app.get("env") === "development") {
  console.log("Morgan enabled ...");
  app.use(morgan("tiny"));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", express.static(path.join(__dirname, "angular")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.use("/api", tokenRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res, next) => {
  if (conf == undefined) {
    res.status(500).send("Configuration file not found");
  } else {
    try {
      res.sendFile(path.join(__dirname, "angular", "index.html"));
    } catch (error) {
      console.log("Configuration file found, but some other error occurred");
      res.status(500).send("Configuration file found, but some other error occurred");
    }
  }
});

module.exports = app;

