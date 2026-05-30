const supabase = require("../services/supabaseService");

// =========================
// GET
// =========================
exports.getOrg = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tbl_org")
      .select("*")
      .order("org_id", { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// CREATE
// =========================
exports.createOrg = async (req, res) => {
  try {
    const { org_nm, org_place } = req.body;

    if (!org_nm) {
      return res.status(400).json({
        success: false,
        message: "org_nm is required",
      });
    }

    const { data, error } = await supabase
      .from("tbl_org")
      .insert([
        {
          org_nm,
          org_place,
        },
      ])
      .select();

    if (error) throw error;

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// UPDATE
// =========================
exports.updateOrg = async (req, res) => {
  try {
    const { id } = req.params;
    const { org_nm, org_place } = req.body;

    const { data, error } = await supabase
      .from("tbl_org")
      .update({
        org_nm,
        org_place,
      })
      .eq("org_id", id)
      .select();

    if (error) throw error;

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// DELETE
// =========================
exports.deleteOrg = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("tbl_org").delete().eq("org_id", id);

    if (error) throw error;

    return res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
