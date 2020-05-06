const express = require("express"); // importing a CommonJS module
const morgan = require("morgan");
const helmet = require("helmet");

const hubsRouter = require("./hubs/hubs-router.js");

const server = express();

// global middleware
server.use(express.json()); // built in middleware, no need to npm install it
server.use(morgan("combined")); // third party
server.use(helmet());

server.use("/api/hubs", gate, role("dwarf"), hubsRouter);

function role(roleName) {
  return function (req, res, next) {
    let role = req.headers.role;

    if (role === roleName) {
      next();
    } else {
      res.status(403).json({ you: "have no power here" });
    }
  };
}

function gate(req, res, next) {
  let password = req.headers.password;

  if (password && typeof password === "string") {
    password = password.toLowerCase();

    if (password === "mellon") {
      next();
    } else {
      res.status(401).json({ you: "cannot pass!" });
    }
  } else {
    res.status(400).json({ message: "speak friend and enter" });
  }
}

// three amigas
// server.use(function (req, res, next) {
//   const today = new Date().toISOString(); // YYYY-MM-DD
//   console.log(`[${today}] ${req.method} to ${req.url}`);

//   next();
// });

// server.use(gate);

server.get("/moria", gate, (req, res) => {
  res.status(200).json({ welcome: "friends" });
});

function errorHandler(error, req, res, next) {
  res.status(500).json({ message: error.message });
}

// before the request handler runs, have a middleware that makes your name available to display
function addMe(req, res, next) {
  req.name = "Luis";

  next(new Error("database error"));
}

server.get("/", addMe, (req, res) => {
  const name = req.name || "stranger";

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome ${name} to the Lambda Hubs API</p>
    `);
});

server.use(errorHandler);

module.exports = server;
