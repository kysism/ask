const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  express.static(path.join(__dirname, "public"), {
    index: false,
  }),
);

// ROUTES
app.use("/api/fcm", require("./routes/fcmRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/org", require("./routes/orgRoutes"));
app.use("/api/class", require("./routes/classRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/survey-title", require("./routes/surveyTitleRoutes"));
app.use("/api/survey-item", require("./routes/surveyItemRoutes"));
app.use("/api/survey-result", require("./routes/surveyResultRoutes"));

/* ROOT EXPLICIT */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/login.html"));
});

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
