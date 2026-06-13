const supabase = require("../services/supabaseService");

// =========================
// SURVEY TITLE
// =========================
exports.getTitle = async (req, res) => {
  try {
    const { survey_id } = req.query;

    const { data, error } = await supabase
      .from("tbl_survey")
      .select("*")
      .eq("survey_id", survey_id);

    if (error) throw error;

    res.json({
      success: true,
      data: data?.[0] || null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// SURVEY ITEMS
// =========================
exports.getItems = async (req, res) => {
  try {
    const { survey_id } = req.query;

    const { data, error } = await supabase
      .from("tbl_survey_item")
      .select("*")
      .eq("survey_id", survey_id)
      .order("survey_item_id", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// DUPLICATE CHECK
// =========================
exports.checkDuplicate = async (req, res) => {
  const { survey_id, ip } = req.query;

  const { data, error } = await supabase
    .from("tbl_result")
    .select("id")
    .eq("survey_id", survey_id)
    .eq("ip_address", ip)
    .limit(1);

  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  res.json({
    success: true,
    duplicated: data && data.length > 0,
  });
};

exports.submitSurvey = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { survey_id, guest_uuid, org_id, class_id, answers } = req.body;

    if (!survey_id || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
      });
    }

    const payload = answers.map((a) => ({
      survey_id,
      survey_item_id: a.survey_item_id,
      survey_item_answer: a.survey_item_answer,

      org_id: org_id || null,
      class_id: class_id || null,
      guest_uuid: guest_uuid || null,
    }));

    console.log("INSERT PAYLOAD:", payload);

    const { error } = await supabase.from("tbl_result").insert(payload);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
