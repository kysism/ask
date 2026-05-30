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
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* CREATE */
exports.create = async (req, res) => {
  try {
    const { survey_title, use_yn } = req.body;

    const { data, error } = await supabase
      .from("tbl_survey")
      .insert([
        {
          survey_title,
          use_yn: use_yn ?? true,
        },
      ])
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* UPDATE */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const { survey_title, use_yn } = req.body;

    const { data, error } = await supabase
      .from("tbl_survey")
      .update({
        survey_title,
        use_yn,
      })
      .eq("survey_id", Number(id))
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* DELETE */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("tbl_survey")
      .delete()
      .eq("survey_id", Number(id));

    if (error) throw error;

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
