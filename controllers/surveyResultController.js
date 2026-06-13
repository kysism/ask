const supabase = require("../services/supabaseService");

exports.getResultBySurvey = async (req, res) => {
  try {
    const { survey_id, org, class: class_id } = req.query;

    let query = supabase.from("tbl_result").select(`
        survey_item_answer,
        guest_uuid,
        survey_id,
        org_id,
        class_id,
        tbl_survey_item(
          survey_item,
          survey_item_type
        )
      `);

    // =========================
    // BASE FILTER (mandatory)
    // =========================
    if (survey_id) {
      query = query.eq("survey_id", survey_id);
    }

    // =========================
    // OPTIONAL FILTERS
    // =========================
    if (org) {
      query = query.eq("org_id", org);
    }

    if (class_id) {
      query = query.eq("class_id", class_id);
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

exports.getResultDetailByRespondent = async (req, res) => {
  try {
    const { survey_id, org, class: class_id } = req.query;

    let query = supabase.from("tbl_result").select(`
        survey_item_answer,
        guest_uuid,
        survey_id,
        org_id,
        class_id,
        tbl_survey_item(
          survey_item,
          survey_item_type
        )
      `);

    if (survey_id) {
      query = query.eq("survey_id", survey_id);
    }

    if (org) {
      query = query.eq("org_id", org);
    }

    if (class_id) {
      query = query.eq("class_id", class_id);
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
