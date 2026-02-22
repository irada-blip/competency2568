// controllers/results.controller.js
const db = require("../db/knex");

/**
 * GET /api/results
 * List all evaluation results
 */
exports.list = async (req, res, next) => {
  try {
    const { period_id, evaluator_id, evaluatee_id, topic_id, indicator_id, status } = req.query;

    let query = db("evaluation_results as er")
      .join("evaluation_periods as ep", "ep.id", "er.period_id")
      .join("evaluation_topics as et", "et.id", "er.topic_id")
      .join("indicators as ind", "ind.id", "er.indicator_id")
      .join("users as eva", "eva.id", "er.evaluator_id")
      .join("users as ee", "ee.id", "er.evaluatee_id")
      .select(
        "er.id",
        "er.period_id",
        "er.evaluatee_id",
        "er.evaluator_id",
        "er.topic_id",
        "er.indicator_id",
        "er.score",
        "er.value_yes_no",
        "er.notes",
        "er.status",
        "er.created_at",
        "er.updated_at",
        db.raw("ep.name_th as period_name"),
        db.raw("et.title_th as topic_name"),
        db.raw("ind.name_th as indicator_name"),
        db.raw("eva.name_th as evaluator_name"),
        db.raw("ee.name_th as evaluatee_name")
      );

    if (period_id) {
      query = query.where("er.period_id", period_id);
    }

    if (evaluator_id) {
      query = query.where("er.evaluator_id", evaluator_id);
    }

    if (evaluatee_id) {
      query = query.where("er.evaluatee_id", evaluatee_id);
    }

    if (topic_id) {
      query = query.where("er.topic_id", topic_id);
    }

    if (indicator_id) {
      query = query.where("er.indicator_id", indicator_id);
    }

    if (status) {
      query = query.where("er.status", status);
    }

    const items = await query.orderBy("er.id", "desc");
    return res.json({ success: true, items, total: items.length });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/results/:id
 * Get single result
 */
exports.get = async (req, res, next) => {
  try {
    const row = await db("evaluation_results as er")
      .join("evaluation_periods as ep", "ep.id", "er.period_id")
      .join("evaluation_topics as et", "et.id", "er.topic_id")
      .join("indicators as ind", "ind.id", "er.indicator_id")
      .join("users as eva", "eva.id", "er.evaluator_id")
      .join("users as ee", "ee.id", "er.evaluatee_id")
      .select(
        "er.id",
        "er.period_id",
        "er.evaluatee_id",
        "er.evaluator_id",
        "er.topic_id",
        "er.indicator_id",
        "er.score",
        "er.value_yes_no",
        "er.notes",
        "er.status",
        "er.created_at",
        "er.updated_at",
        db.raw("ep.name_th as period_name"),
        db.raw("et.title_th as topic_name"),
        db.raw("ind.name_th as indicator_name"),
        db.raw("eva.name_th as evaluator_name"),
        db.raw("ee.name_th as evaluatee_name")
      )
      .where("er.id", req.params.id)
      .first();

    if (!row) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }
    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/results
 * Create new result
 */
exports.create = async (req, res, next) => {
  try {
    const {
      period_id,
      evaluatee_id,
      evaluator_id,
      topic_id,
      indicator_id,
      score,
      value_yes_no,
      notes,
    } = req.body;

    if (!period_id || !evaluatee_id || !evaluator_id || !topic_id || !indicator_id) {
      return res.status(400).json({
        success: false,
        message: "period_id, evaluatee_id, evaluator_id, topic_id, and indicator_id are required",
      });
    }

    // Verify all references exist
    const period = await db("evaluation_periods").where({ id: period_id }).first();
    if (!period) {
      return res.status(404).json({ success: false, message: "Period not found" });
    }

    const evaluatee = await db("users").where({ id: evaluatee_id }).first();
    if (!evaluatee) {
      return res.status(404).json({ success: false, message: "Evaluatee not found" });
    }

    const evaluator = await db("users").where({ id: evaluator_id }).first();
    if (!evaluator) {
      return res.status(404).json({ success: false, message: "Evaluator not found" });
    }

    const topic = await db("evaluation_topics").where({ id: topic_id }).first();
    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    const indicator = await db("indicators").where({ id: indicator_id }).first();
    if (!indicator) {
      return res.status(404).json({ success: false, message: "Indicator not found" });
    }

    const [id] = await db("evaluation_results").insert({
      period_id,
      evaluatee_id,
      evaluator_id,
      topic_id,
      indicator_id,
      score: score !== undefined ? parseFloat(score) : null,
      value_yes_no: value_yes_no !== undefined ? value_yes_no : null,
      notes: notes || null,
      status: "draft",
    });

    res.status(201).json({
      success: true,
      data: {
        id,
        period_id,
        evaluatee_id,
        evaluator_id,
        topic_id,
        indicator_id,
        score: score !== undefined ? parseFloat(score) : null,
        value_yes_no: value_yes_no !== undefined ? value_yes_no : null,
        notes: notes || null,
        status: "draft",
      },
    });
  } catch (e) {
    next(e);
  }
};

/**
 * PUT /api/results/:id
 * Update result
 */
exports.update = async (req, res, next) => {
  try {
    const { score, value_yes_no, notes, status } = req.body;
    const id = req.params.id;

    const row = await db("evaluation_results").where({ id }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    const updateData = {};
    if (score !== undefined) updateData.score = score !== null ? parseFloat(score) : null;
    if (value_yes_no !== undefined) updateData.value_yes_no = value_yes_no;
    if (notes !== undefined) updateData.notes = notes || null;
    if (status !== undefined) updateData.status = status;

    await db("evaluation_results").where({ id }).update(updateData);

    const updated = await db("evaluation_results").where({ id }).first();
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

/**
 * DELETE /api/results/:id
 * Delete result
 */
exports.delete = async (req, res, next) => {
  try {
    const id = req.params.id;

    const row = await db("evaluation_results").where({ id }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    await db("evaluation_results").where({ id }).delete();
    res.json({ success: true, message: "Result deleted" });
  } catch (e) {
    next(e);
  }
};
