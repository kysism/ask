const supabase = require("../services/supabaseService");

exports.getResultBySurvey = async (req, res) => {
  try {
    const { survey_id } = req.query;

    const { data, error } = await supabase
      .from("tbl_result")
      .select(`*, tbl_survey_item(survey_item, survey_item_type)`)
      .eq("survey_id", survey_id);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
