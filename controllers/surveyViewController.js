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
    const { survey_id, guest_uuid, org_id, class_id, answers } = req.body;

    if (!survey_id || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }

    const ip = getClientIp(req);

    const { data: existing, error: dupErr } = await supabase
      .from("tbl_result")
      .select("id")
      .eq("survey_id", survey_id)
      .eq("ip_address", ip)
      .limit(1);

    if (dupErr) throw dupErr;

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Already submitted",
      });
    }

    const payload = answers.map((a) => ({
      survey_id,
      survey_item_id: a.survey_item_id,
      survey_item_answer: a.survey_item_answer,
      ip_address: ip,

      org_id: org_id || null,
      class_id: class_id || null,
      guest_uuid: guest_uuid || null,
    }));

    console.log("FINAL INSERT PAYLOAD:", payload);

    const { error } = await supabase.from("tbl_result").insert(payload);

    if (error) {
      console.error("INSERT ERROR:", error);
      throw error;
    }

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
