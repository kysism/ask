const supabase = require("../services/supabaseService");

// ===============================
// GET
// ===============================
exports.getSurvey = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tbl_survey")
      .select("*")
      .order("survey_id", { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// CREATE
// ===============================
exports.createSurvey = async (req, res) => {
  try {
    const { survey_title, use_yn } = req.body;

    const { data, error } = await supabase
      .from("tbl_survey")
      .insert([{ survey_title, use_yn }])
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// UPDATE
// ===============================
exports.updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const { survey_title, use_yn } = req.body;

    const { data, error } = await supabase
      .from("tbl_survey")
      .update({ survey_title, use_yn })
      .eq("survey_id", id)
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// DELETE
// ===============================
exports.deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("tbl_survey")
      .delete()
      .eq("survey_id", id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
