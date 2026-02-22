// controllers/assignments.controller.js
const db = require("../db/knex");

/**
 * GET /api/assignments
 * List all assignments
 */
exports.list = async (req, res, next) => {
  try {
    const { period_id, evaluator_id, evaluatee_id } = req.query;

    let query = db("assignments as a")
      .join("users as eva", "eva.id", "a.evaluator_id")
      .join("users as ee", "ee.id", "a.evaluatee_id")
      .select(
        "a.id",
        "a.period_id",
        "a.evaluator_id",
        "a.evaluatee_id",
        "a.dept_id",
        "a.created_at",
        db.raw("eva.name_th as evaluator_name"),
        db.raw("ee.name_th as evaluatee_name")
      );

    if (period_id) {
      query = query.where("a.period_id", period_id);
    }

    if (evaluator_id) {
      query = query.where("a.evaluator_id", evaluator_id);
    }

    if (evaluatee_id) {
      query = query.where("a.evaluatee_id", evaluatee_id);
    }

    const items = await query.orderBy("a.id", "desc");
    return res.json({ success: true, items, total: items.length });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/assignments/:id
 * Get single assignment
 */
exports.get = async (req, res, next) => {
  try {
    const row = await db("assignments as a")
      .join("users as eva", "eva.id", "a.evaluator_id")
      .join("users as ee", "ee.id", "a.evaluatee_id")
      .select(
        "a.id",
        "a.period_id",
        "a.evaluator_id",
        "a.evaluatee_id",
        "a.dept_id",
        "a.created_at",
        db.raw("eva.name_th as evaluator_name"),
        db.raw("ee.name_th as evaluatee_name")
      )
      .where("a.id", req.params.id)
      .first();

    if (!row) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/assignments
 * Create new assignment
 */
exports.create = async (req, res, next) => {
  try {
    const { period_id, evaluator_id, evaluatee_id, dept_id } = req.body;

    if (!period_id || !evaluator_id || !evaluatee_id) {
      return res.status(400).json({
        success: false,
        message: "period_id, evaluator_id, and evaluatee_id are required",
      });
    }

    // Check if period exists and is active
    const period = await db("evaluation_periods")
      .where({ id: period_id })
      .first();
    if (!period) {
      return res.status(404).json({ success: false, message: "Period not found" });
    }

    // Check if both users exist
    const evaluator = await db("users").where({ id: evaluator_id }).first();
    if (!evaluator || evaluator.role !== "evaluator") {
      return res.status(404).json({
        success: false,
        message: "Evaluator user not found or not an evaluator",
      });
    }

    const evaluatee = await db("users").where({ id: evaluatee_id }).first();
    if (!evaluatee || evaluatee.role !== "evaluatee") {
      return res.status(404).json({
        success: false,
        message: "Evaluatee user not found or not an evaluatee",
      });
    }

    // Check if department exists (if provided)
    if (dept_id) {
      const dept = await db("departments").where({ id: dept_id }).first();
      if (!dept) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }
    }

    // Check for duplicate assignment (UNIQUE constraint)
    const existing = await db("assignments")
      .where({ period_id, evaluator_id, evaluatee_id })
      .first();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Assignment already exists for this evaluator-evaluatee-period",
      });
    }

    const [id] = await db("assignments").insert({
      period_id,
      evaluator_id,
      evaluatee_id,
      dept_id: dept_id || null,
    });

    res.status(201).json({
      success: true,
      data: {
        id,
        period_id,
        evaluator_id,
        evaluatee_id,
        dept_id: dept_id || null,
        evaluator_name: evaluator.name_th,
        evaluatee_name: evaluatee.name_th,
      },
    });
  } catch (e) {
    next(e);
  }
};

/**
 * PUT /api/assignments/:id
 * Update assignment
 */
exports.update = async (req, res, next) => {
  try {
    const { period_id, evaluator_id, evaluatee_id, dept_id } = req.body;
    const id = req.params.id;

    const row = await db("assignments").where({ id }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    const updateData = {};
    if (period_id !== undefined) updateData.period_id = period_id;
    if (evaluator_id !== undefined) updateData.evaluator_id = evaluator_id;
    if (evaluatee_id !== undefined) updateData.evaluatee_id = evaluatee_id;
    if (dept_id !== undefined) updateData.dept_id = dept_id || null;

    await db("assignments").where({ id }).update(updateData);

    const updated = await db("assignments as a")
      .join("users as eva", "eva.id", "a.evaluator_id")
      .join("users as ee", "ee.id", "a.evaluatee_id")
      .select(
        "a.id",
        "a.period_id",
        "a.evaluator_id",
        "a.evaluatee_id",
        "a.dept_id",
        "a.created_at",
        db.raw("eva.name_th as evaluator_name"),
        db.raw("ee.name_th as evaluatee_name")
      )
      .where("a.id", id)
      .first();

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

/**
 * DELETE /api/assignments/:id
 * Delete assignment
 */
exports.delete = async (req, res, next) => {
  try {
    const id = req.params.id;

    const row = await db("assignments").where({ id }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    await db("assignments").where({ id }).delete();
    res.json({ success: true, message: "Assignment deleted" });
  } catch (e) {
    next(e);
  }
};
