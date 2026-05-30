const supabase = require("../services/supabaseService");

/* =========================
   GET ALL (with JOIN)
========================= */
exports.getAll = async (req, res) => {
  try {
    const { survey_id } = req.query;

    let query = supabase
      .from("tbl_survey_item")
      .select("*, tbl_survey(survey_title)")
      .order("survey_item_id", { ascending: false });

    if (survey_id) {
      query = query.eq("survey_id", Number(survey_id));
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* =========================
   GET ONE
========================= */
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("tbl_survey_item")
      .select("*")
      .eq("survey_item_id", Number(id))
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* =========================
   CREATE
========================= */
exports.create = async (req, res) => {
  try {
    const { survey_id, survey_item, survey_item_type, survey_item_mandatory } =
      req.body;

    const { data, error } = await supabase
      .from("tbl_survey_item")
      .insert([
        {
          survey_id: Number(survey_id),
          survey_item,
          survey_item_type,
          survey_item_mandatory,
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

/* =========================
   UPDATE
========================= */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const { survey_id, survey_item, survey_item_type, survey_item_mandatory } =
      req.body;

    const { data, error } = await supabase
      .from("tbl_survey_item")
      .update({
        survey_id: Number(survey_id),
        survey_item,
        survey_item_type,
        survey_item_mandatory,
      })
      .eq("survey_item_id", Number(id))
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

/* =========================
   DELETE
========================= */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("tbl_survey_item")
      .delete()
      .eq("survey_item_id", Number(id));

    if (error) throw error;

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
