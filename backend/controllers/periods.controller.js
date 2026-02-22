// controllers/periods.controller.js
const db = require("../db/knex");

/**
 * GET /api/periods
 * List all evaluation periods
 */
exports.list = async (req, res, next) => {
  try {
    const { is_active } = req.query;
    let query = db("evaluation_periods").select(
      "id",
      "code",
      "name_th",
      "buddhist_year",
      "start_date",
      "end_date",
      "is_active",
      "created_at"
    );

    if (is_active !== undefined) {
      query = query.where("is_active", is_active ? 1 : 0);
    }

    const items = await query.orderBy("id", "desc");
    return res.json({ success: true, items, total: items.length });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/periods/:id
 * Get single period
 */
exports.get = async (req, res, next) => {
  try {
    const row = await db("evaluation_periods")
      .select(
        "id",
        "code",
        "name_th",
        "buddhist_year",
        "start_date",
        "end_date",
        "is_active",
        "created_at"
      )
      .where({ id: req.params.id })
      .first();

    if (!row) {
      return res.status(404).json({ success: false, message: "Period not found" });
    }
    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/periods
 * Create new period
 */
exports.create = async (req, res, next) => {
  try {
    const { code, name_th, buddhist_year, start_date, end_date, is_active = 0 } = req.body;

    if (!code || !name_th || !buddhist_year || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "code, name_th, buddhist_year, start_date, and end_date are required",
      });
    }

    // Check if code already exists
    const existing = await db("evaluation_periods").where({ code }).first();
    if (existing) {
      return res.status(409).json({ success: false, message: "Code already exists" });
    }

    const [id] = await db("evaluation_periods").insert({
      code,
      name_th,
      buddhist_year: parseInt(buddhist_year),
      start_date,
      end_date,
      is_active: is_active ? 1 : 0,
    });

    res.status(201).json({
      success: true,
      data: {
        id,
        code,
        name_th,
        buddhist_year: parseInt(buddhist_year),
        start_date,
        end_date,
        is_active: is_active ? 1 : 0,
      },
    });
  } catch (e) {
    next(e);
  }
};

/**
 * PUT /api/periods/:id
 * Update period
 */
exports.update = async (req, res, next) => {
  try {
    const { code, name_th, buddhist_year, start_date, end_date, is_active } = req.body;
    const id = req.params.id;

    const row = await db("evaluation_periods").where({ id }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: "Period not found" });
    }

    // Check code uniqueness if changed
    if (code && code !== row.code) {
      const existing = await db("evaluation_periods").where({ code }).first();
      if (existing) {
        return res.status(409).json({ success: false, message: "Code already exists" });
      }
    }

    const updateData = {};
    if (code !== undefined) updateData.code = code;
    if (name_th !== undefined) updateData.name_th = name_th;
    if (buddhist_year !== undefined) updateData.buddhist_year = parseInt(buddhist_year);
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

    await db("evaluation_periods").where({ id }).update(updateData);

    const updated = await db("evaluation_periods").where({ id }).first();
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

/**
 * DELETE /api/periods/:id
 * Delete period
 */
exports.delete = async (req, res, next) => {
  try {
    const id = req.params.id;

    const row = await db("evaluation_periods").where({ id }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: "Period not found" });
    }

    await db("evaluation_periods").where({ id }).delete();
    res.json({ success: true, message: "Period deleted" });
  } catch (e) {
    next(e);
  }
};
