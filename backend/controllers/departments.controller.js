// controllers/departments.controller.js
const db = require("../db/knex");

/**
 * GET /api/departments
 * List all departments
 */
exports.list = async (req, res, next) => {
  try {
    const items = await db("departments as d")
      .join("vocational_categories as vc", "vc.id", "d.category_id")
      .join("org_groups as og", "og.id", "d.org_group_id")
      .select(
        "d.id",
        "d.code",
        "d.name_th",
        "d.category_id",
        "d.org_group_id",
        db.raw("vc.name_th as category_name"),
        db.raw("og.name_th as org_group_name")
      )
      .orderBy("d.id", "desc");

    return res.json({ success: true, items, total: items.length });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/departments/:id
 * Get single department with its fields
 */
exports.get = async (req, res, next) => {
  try {
    const dept = await db("departments as d")
      .join("vocational_categories as vc", "vc.id", "d.category_id")
      .join("org_groups as og", "og.id", "d.org_group_id")
      .select(
        "d.id",
        "d.code",
        "d.name_th",
        "d.category_id",
        "d.org_group_id",
        db.raw("vc.name_th as category_name"),
        db.raw("og.name_th as org_group_name")
      )
      .where("d.id", req.params.id)
      .first();

    if (!dept) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    // Get associated vocational fields
    const fields = await db("dept_fields as df")
      .join("vocational_fields as vf", "vf.code", "df.field_code")
      .select("vf.code", "vf.name_th")
      .where("df.dept_id", dept.id);

    res.json({
      success: true,
      data: {
        ...dept,
        vocational_fields: fields,
      },
    });
  } catch (e) {
    next(e);
  }
};
