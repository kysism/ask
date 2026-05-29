const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const allowedOrigins = ["https://ask-21w3.onrender.com"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ROUTES
app.use("/api/org", require("./routes/orgRoutes"));
// app.use("/api/class", require("./routes/classRoutes"));
// app.use("/api/student", require("./routes/studentRoutes"));
// app.use("/api/survey-title", require("./routes/surveyTitleRoutes"));
// app.use("/api/survey-item", require("./routes/surveyItemRoutes"));
// app.use("/api/survey-result", require("./routes/surveyResultRoutes"));

/* ROOT EXPLICIT */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/login.html"));
});

/* STATIC BUT NO INDEX OVERRIDE */
app.use(
  express.static(path.join(__dirname, "public"), {
    index: false,
  }),
);

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
