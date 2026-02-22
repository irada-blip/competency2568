// controllers/topics.controller.js
const db = require("../db/knex");

/**
 * GET /api/topics
 * List all evaluation topics
 */
exports.list = async (req, res, next) => {
  try {
    const items = await db("evaluation_topics")
      .select("id", "code", "title_th", "description", "weight", "active", "created_at")
      .orderBy("id", "desc");
    return res.json({ success: true, items, total: items.length });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/topics/:id
 * Get single topic
 */
exports.get = async (req, res, next) => {
  try {
    const row = await db("evaluation_topics")
      .select("id", "code", "title_th", "description", "weight", "active", "created_at")
      .where({ id: req.params.id })
      .first();

    if (!row) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }
    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/topics
 * Create new topic
 */
exports.create = async (req, res, next) => {
  try {
    const { code, title_th, description, weight = 0, active = 1 } = req.body;

    if (!code || !title_th) {
      return res.status(400).json({ success: false, message: "code and title_th are required" });
    }

    // Check if code already exists
    const existing = await db("evaluation_topics").where({ code }).first();
    if (existing) {
      return res.status(409).json({ success: false, message: "Code already exists" });
    }

    const [id] = await db("evaluation_topics").insert({
      code,
      title_th,
      description: description || null,
      weight: parseFloat(weight) || 0,
      active: active ? 1 : 0,
    });

    res.status(201).json({
      success: true,
      data: {
        id,
        code,
        title_th,
        description: description || null,
        weight: parseFloat(weight) || 0,
        active: active ? 1 : 0,
      },
    });
  } catch (e) {
    next(e);
  }
};

/**
 * PUT /api/topics/:id
 * Update topic
 */
exports.update = async (req, res, next) => {
  try {
    const { code, title_th, description, weight, active } = req.body;
    const id = req.params.id;

    const row = await db("evaluation_topics").where({ id }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    // Check code uniqueness if changed
    if (code && code !== row.code) {
      const existing = await db("evaluation_topics").where({ code }).first();
      if (existing) {
        return res.status(409).json({ success: false, message: "Code already exists" });
      }
    }

    const updateData = {};
    if (code !== undefined) updateData.code = code;
    if (title_th !== undefined) updateData.title_th = title_th;
    if (description !== undefined) updateData.description = description || null;
    if (weight !== undefined) updateData.weight = parseFloat(weight);
    if (active !== undefined) updateData.active = active ? 1 : 0;

    await db("evaluation_topics").where({ id }).update(updateData);

    const updated = await db("evaluation_topics").where({ id }).first();
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

/**
 * DELETE /api/topics/:id
 * Delete topic
 */
exports.delete = async (req, res, next) => {
  try {
    const id = req.params.id;

    const row = await db("evaluation_topics").where({ id }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    await db("evaluation_topics").where({ id }).delete();
    res.json({ success: true, message: "Topic deleted" });
  } catch (e) {
    next(e);
  }
};
