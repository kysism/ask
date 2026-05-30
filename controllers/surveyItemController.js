const supabase = require("../services/supabaseService");

// GET
exports.getAll = async (req, res) => {
  try {
    const { survey_id } = req.query;

    let query = supabase
      .from("tbl_survey_item")
      .select(`*, tbl_survey(survey_title)`)
      .order("survey_item_id", { ascending: false });

    if (survey_id) query = query.eq("survey_id", survey_id);

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { survey_id, survey_item, survey_item_type, survey_item_mandatory } =
      req.body;

    const { data, error } = await supabase
      .from("tbl_survey_item")
      .insert([
        {
          survey_id,
          survey_item,
          survey_item_type,
          survey_item_mandatory,
        },
      ])
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("tbl_survey_item")
      .update(req.body)
      .eq("survey_item_id", id)
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("tbl_survey_item")
      .delete()
      .eq("survey_item_id", id);

    if (error) throw error;

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
