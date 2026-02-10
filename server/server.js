const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./src/services/db.service");
const contentRouter = require("./src/routes/content.route");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use("/", contentRouter);

app.use(express.static(path.join(__dirname, "../client/dist")));

connectDB();

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});