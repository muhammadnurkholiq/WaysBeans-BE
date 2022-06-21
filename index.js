// dotenv
require("dotenv").config();
// express
const express = require("express");
// cors
const cors = require("cors");
// router
const router = require("./src/routes");

// http
const http = require("http");

// socket
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

// server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  },
});

require("./src/socket")(io);

const port = process.env.PORT || 5000;

app.use("/api/v1/", router);

app.get("/", (req, res) => {
  res.send("Hello Developer!!!");
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
