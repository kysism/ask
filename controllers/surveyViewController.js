const { createClient } = require("@supabase/supabase-js");

// =========================
// SUPABASE INIT
// =========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// =========================
// IP HELPER
// =========================
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

// =========================
// SURVEY TITLE
// =========================
exports.getSurveyTitle = async (req, res) => {
  try {
    const { survey_id } = req.query;

    if (!survey_id) {
      return res.status(400).json({
        success: false,
        message: "survey_id required",
      });
    }

    const { data, error } = await supabase
      .from("tbl_survey")
      .select("survey_id, survey_title")
      .eq("survey_id", survey_id)
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("getSurveyTitle error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// SURVEY QUESTIONS
// =========================
exports.getSurveyQuestions = async (req, res) => {
  try {
    const { survey_id } = req.query;

    if (!survey_id) {
      return res.status(400).json({
        success: false,
        message: "survey_id required",
      });
    }

    const { data, error } = await supabase
      .from("tbl_survey_item")
      .select("*")
      .eq("survey_id", survey_id)
      .order("survey_item_id", { ascending: true });

    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    console.error("getSurveyQuestions error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// DUPLICATE CHECK (IP BASED)
// =========================
exports.checkDuplicate = async (req, res) => {
  try {
    const { survey_id } = req.query;

    if (!survey_id) {
      return res.status(400).json({
        success: false,
        message: "survey_id required",
      });
    }

    const ip = getClientIp(req);

    const { data, error } = await supabase
      .from("tbl_result")
      .select("id")
      .eq("survey_id", survey_id)
      .eq("ip_address", ip)
      .limit(1);

    if (error) throw error;

    return res.json({
      success: true,
      duplicated: (data || []).length > 0,
    });
  } catch (err) {
    console.error("checkDuplicate error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// SUBMIT SURVEY
// =========================
exports.submitSurvey = async (req, res) => {
  try {
    const { survey_id, answers } = req.body;

    if (!survey_id || !answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }

    const ip = getClientIp(req);

    // =========================
    // DUPLICATE CHECK (SERVER SIDE SAFETY)
    // =========================
    const { data: existing } = await supabase
      .from("tbl_result")
      .select("id")
      .eq("survey_id", survey_id)
      .eq("ip_address", ip)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Already submitted",
      });
    }

    // =========================
    // BUILD PAYLOAD
    // =========================
    const payload = Object.entries(answers).map(([item_id, value]) => ({
      survey_id,
      survey_item_id: Number(item_id),
      survey_item_answer: value,
      ip_address: ip,
    }));

    if (payload.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No answers provided",
      });
    }

    // =========================
    // INSERT
    // =========================
    const { error } = await supabase.from("tbl_result").insert(payload);

    if (error) throw error;

    return res.json({
      success: true,
      message: "Survey submitted successfully",
    });
  } catch (err) {
    console.error("submitSurvey error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
