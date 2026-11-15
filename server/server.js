require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const startExpiryAlertJob = require("./src/jobs/expiryAlertJob");

connectDB();
startExpiryAlertJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`Swagger Docs at:   http://localhost:${PORT}/api-docs`);
});
