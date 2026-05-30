const supabase = require("../services/supabaseService");

// GET RESULT BY SURVEY
exports.getResultBySurvey = async (req, res) => {
  try {
    const { survey_id } = req.query;

    let query = supabase.from("tbl_result").select(`
        *,
        tbl_survey_item(
          survey_item,
          survey_item_type
        )
      `);

    if (survey_id) {
      query = query.eq("survey_id", survey_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
