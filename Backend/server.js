const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const ensureAdminAccount = require("./utils/ensureAdminAccount");

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => ensureAdminAccount()).catch((error) => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});

const app = express();

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// --- ROUTES ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));

// Admin Routes 
app.use("/api/admin", require("./routes/adminRoutes"));

// --- SWAGGER DOCS ---
const swaggerSpec = require("./config/swagger");

// Serve the raw swagger spec as JSON
app.get("/api-docs/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Serve Swagger UI via CDN (works on Vercel serverless)
app.get("/api-docs", (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>Onic Litex API Docs</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({
        url: "/api-docs/swagger.json",
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        layout: "BaseLayout"
      });
    </script>
  </body>
</html>`);
});

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Library API is running...");
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
