const supabase = require("../services/supabaseService");

/* GET ALL */
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tbl_survey")
      .select("*")
      .order("survey_id", { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* CREATE */
exports.create = async (req, res) => {
  try {
    const { survey_title, use_yn } = req.body;

    const { data, error } = await supabase
      .from("tbl_survey")
      .insert([{ survey_title, use_yn }])
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* UPDATE */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("tbl_survey")
      .update(req.body)
      .eq("survey_id", id)
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* DELETE */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("tbl_survey")
      .delete()
      .eq("survey_id", id);

    if (error) throw error;

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
