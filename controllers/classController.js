const supabase = require("../services/supabaseService");

// ===============================
// GET CLASS
// ===============================
exports.getClass = async (req, res) => {
  try {
    const { org_id } = req.query;

    let query = supabase
      .from("tbl_class")
      .select(
        `
        class_id,
        class_nm,
        org_id,
        tbl_org (
          org_nm
        )
      `,
      )
      .order("class_id", { ascending: false });

    if (org_id) {
      query = query.eq("org_id", org_id);
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

// ===============================
// CREATE
// ===============================
exports.createClass = async (req, res) => {
  try {
    const { org_id, class_nm } = req.body;

    const { data, error } = await supabase
      .from("tbl_class")
      .insert([
        {
          org_id,
          class_nm,
        },
      ])
      .select();

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

// ===============================
// UPDATE
// ===============================
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { org_id, class_nm } = req.body;

    const { data, error } = await supabase
      .from("tbl_class")
      .update({
        org_id,
        class_nm,
      })
      .eq("class_id", id)
      .select();

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

// ===============================
// DELETE
// ===============================
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("tbl_class")
      .delete()
      .eq("class_id", id);

    if (error) throw error;

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
