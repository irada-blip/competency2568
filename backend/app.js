const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");
const attachmentsApi = require("./routes/attachments");   // << เพิ่มบรรทัดนี้
// Swagger
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' }));
// app.use(cors());
app.use(express.urlencoded({ extended: true }));  // ใส่คู่กับ express.json()
app.use(express.json());
app.use(morgan("dev"));
app.get('/oak',function(req,res){ 
  console.log("req=",req.query)
    res.send({
      status: 'Hello World oak!',
      data: req.query
      })
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Health
//http://localhost:7000/health
app.get("/health", (req, res) => {
  res.json({ service: "okoak", time: new Date().toISOString() });
});

// ให้ /openapi.json ส่งไฟล์จริงแบบ no-store เพื่อไม่ให้แคช
app.get("/openapi.json", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "openapi.json"));
});

// ให้ Swagger UI ไปดึงสเปกจาก URL ด้านบน (สดใหม่เสมอ)
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: { url: "/openapi.json" },
  })
);
const userRoutes = require("./routes/users.routes");
const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");
const topicsRoutes = require("./routes/topics.routes");
const indicatorsRoutes = require("./routes/indicators.routes");
const periodsRoutes = require("./routes/periods.routes");
const assignmentsRoutes = require("./routes/assignments.routes");
const resultsRoutes = require("./routes/results.routes");
const departmentsRoutes = require("./routes/departments.routes");

// http://localhost:7000/api/auth/login
app.use("/api/auth", authRoutes);
// http://localhost:7000/api/users
app.use("/api/users", userRoutes);
// http://localhost:7000/api/upload
app.use("/api/upload", uploadRoutes);
// http://localhost:7000/api/topics
app.use("/api/topics", topicsRoutes);
// http://localhost:7000/api/indicators
app.use("/api/indicators", indicatorsRoutes);
// http://localhost:7000/api/periods
app.use("/api/periods", periodsRoutes);
// http://localhost:7000/api/assignments
app.use("/api/assignments", assignmentsRoutes);
// http://localhost:7000/api/results
app.use("/api/results", resultsRoutes);
// http://localhost:7000/api/departments
app.use("/api/departments", departmentsRoutes);

// << เส้นทางสำหรับ attachments และ GET /api/periods/active, GET /api/indicators, etc.
app.use("/api", attachmentsApi);           // จะได้ /api/periods/active, /api/indicators (legacy), /api/attachments


app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "ไม่พบหน้านี้" });
});

// Error handler
const error = require("./middlewares/error");
app.use(error);
// console.log(module);// Debug: log the module object to see its properties

module.exports = app;
