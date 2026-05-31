const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// =========================
// SURVEY TITLE
// =========================
exports.getTitle = async (req, res) => {
  const { survey_id } = req.query;

  const { data, error } = await supabase
    .from("tbl_survey")
    .select("*")
    .eq("survey_id", survey_id)
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  res.json({
    success: true,
    data,
  });
};

// =========================
// SURVEY ITEMS
// =========================
exports.getItems = async (req, res) => {
  const { survey_id } = req.query;

  const { data, error } = await supabase
    .from("tbl_survey_item")
    .select("*")
    .eq("survey_id", survey_id)
    .order("survey_item_id", { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  res.json({
    success: true,
    data,
  });
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

// =========================
// SUBMIT SURVEY
// =========================
exports.submitSurvey = async (req, res) => {
  const payload = req.body;

  if (!Array.isArray(payload) || payload.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid payload",
    });
  }

  const { error } = await supabase.from("tbl_result").insert(payload);

  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  res.json({
    success: true,
  });
};
