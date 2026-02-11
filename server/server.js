const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const swaggerConfig = require("./src/v1/configs/swagger.configs");
const connectDB = require("./src/v1/services/db.services");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

swaggerConfig(app);

app.use("/api/v1", require("./src/v1/routes"));
app.use(express.static(path.join(__dirname, "../client/dist")));

connectDB();

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});
