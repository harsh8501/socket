import express from "express";
import { Server } from "socket.io";
import http from "http";
import axios from "axios";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get("/", (req, resp) => {
  resp.sendFile(__dirname + "/index.html");
});

//Get Data from URL
const getData = async () => {
  try {
    const result = await axios.get("https://suncrypto.in/socket/market.php");
    return result.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

//emit data to client in every 10 sec
setInterval(async () => {
  const currentTime = new Date().toLocaleTimeString();
  console.log(`Getting data at ${currentTime}`);
  const data = await getData();
  if (data !== null) {
    io.emit("dataUpdate", data);
    console.log(`Data emitted to clients at ${currentTime}`);
  }
}, 10000);

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(cors());
