const supabase = require("../services/supabaseService");

// GET
exports.getStudent = async (req, res) => {
  try {
    const { class_id } = req.query;

    let query = supabase
      .from("tbl_student")
      .select(
        `
        student_id,
        student_nm,
        class_id,
        tbl_class (
          class_nm
        )
      `,
      )
      .order("student_id", { ascending: false });

    if (class_id) query = query.eq("class_id", class_id);

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE
exports.createStudent = async (req, res) => {
  try {
    const { class_id, student_nm } = req.body;

    const { data, error } = await supabase
      .from("tbl_student")
      .insert([{ class_id, student_nm }])
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, student_nm } = req.body;

    const { data, error } = await supabase
      .from("tbl_student")
      .update({ class_id, student_nm })
      .eq("student_id", id)
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("tbl_student")
      .delete()
      .eq("student_id", id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
