let express = require("express");
let cors = require("cors");
let app = express();
let bearerToken = require("express-bearer-token");
let socketio = require("socket.io");
const http = require("http");
let admin = require("firebase-admin");

var serviceAccount = require("./service.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());

const httpServer = http.createServer(app);

const io = socketio(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(bearerToken());

app.use(function (req, res, next) {
  if (req.token) {
    admin
      .auth()
      .verifyIdToken(req.token)
      .then(function (response) {
        console.log(response);
        req.user = response;
        next();
      })
      .catch(function (error) {
        res.sendStatus(401);
      });
  } else {
    res.sendStatus(401);
  }
});

io.on("connection", function (socket) {
  console.log("Connected to Client");
  socket.on("message", function (payload) {
    console.log(payload);
    io.sockets.emit("message", payload);
  })
});

httpServer.listen(5000);
