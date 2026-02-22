// controllers/indicators.controller.js
const db = require("../db/knex");

/**
 * GET /api/indicators
 * List all indicators
 */
exports.list = async (req, res, next) => {
  try {
    const { topic_id, active } = req.query;
    let query = db("indicators as i")
      .select(
        "i.id",
        "i.topic_id",
        "i.code",
        "i.name_th",
        "i.description",
        "i.type",
        "i.weight",
        "i.min_score",
        "i.max_score",
        "i.active",
        "i.created_at"
      );

    if (topic_id) {
      query = query.where("i.topic_id", topic_id);
    }

    if (active !== undefined) {
      query = query.where("i.active", active ? 1 : 0);
    }

    const items = await query.orderBy("i.id", "desc");
    return res.json({ success: true, items, total: items.length });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/indicators/:id
 * Get single indicator
 */
exports.get = async (req, res, next) => {
  try {
    const row = await db("indicators")
      .select(
        "id",
        "topic_id",
        "code",
        "name_th",
        "description",
        "type",
        "weight",
        "min_score",
        "max_score",
        "active",
        "created_at"
      )
      .where({ id: req.params.id })
      .first();

    if (!row) {
      return res.status(404).json({ success: false, message: "Indicator not found" });
    }

    // Get evidence types for this indicator
    const evidenceTypes = await db("indicator_evidence as ie")
      .join("evidence_types as et", "et.id", "ie.evidence_type_id")
      .where("ie.indicator_id", row.id)
      .select("et.id", "et.code", "et.name_th");

    res.json({ success: true, data: { ...row, evidence_types: evidenceTypes } });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/indicators
 * Create new indicator
 */
exports.create = async (req, res, next) => {
  try {
    const {
      topic_id,
      code,
      name_th,
      description,
      type = "score_1_4",
      weight = 1.0,
      min_score = 1,
      max_score = 4,
      active = 1,
      evidence_type_ids = [],
    } = req.body;

    if (!topic_id || !code || !name_th) {
      return res.status(400).json({
        success: false,
        message: "topic_id, code, and name_th are required",
      });
    }

    // Check if topic exists
    const topic = await db("evaluation_topics").where({ id: topic_id }).first();
    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    // Check if code already exists
    const existing = await db("indicators").where({ code }).first();
    if (existing) {
      return res.status(409).json({ success: false, message: "Code already exists" });
    }

    const [id] = await db("indicators").insert({
      topic_id,
      code,
      name_th,
      description: description || null,
      type,
      weight: parseFloat(weight),
      min_score: parseInt(min_score),
      max_score: parseInt(max_score),
      active: active ? 1 : 0,
    });

    // Insert evidence type mappings if provided
    if (evidence_type_ids && Array.isArray(evidence_type_ids)) {
      for (const evidenceTypeId of evidence_type_ids) {
        await db("indicator_evidence").insert({
          indicator_id: id,
          evidence_type_id: evidenceTypeId,
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        id,
        topic_id,
        code,
        name_th,
        description: description || null,
        type,
        weight: parseFloat(weight),
        min_score: parseInt(min_score),
        max_score: parseInt(max_score),
        active: active ? 1 : 0,
        evidence_type_ids,
      },
    });
  } catch (e) {
    next(e);
  }
};

/**
 * PUT /api/indicators/:id
 * Update indicator
 */
exports.update = async (req, res, next) => {
  try {
    const {
      topic_id,
      code,
      name_th,
      description,
      type,
      weight,
      min_score,
      max_score,
      active,
      evidence_type_ids,
    } = req.body;
    const id = req.params.id;

    const row = await db("indicators").where({ id }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: "Indicator not found" });
    }

    // Check code uniqueness if changed
    if (code && code !== row.code) {
      const existing = await db("indicators").where({ code }).first();
      if (existing) {
        return res.status(409).json({ success: false, message: "Code already exists" });
      }
    }

    const updateData = {};
    if (topic_id !== undefined) updateData.topic_id = topic_id;
    if (code !== undefined) updateData.code = code;
    if (name_th !== undefined) updateData.name_th = name_th;
    if (description !== undefined) updateData.description = description || null;
    if (type !== undefined) updateData.type = type;
    if (weight !== undefined) updateData.weight = parseFloat(weight);
    if (min_score !== undefined) updateData.min_score = parseInt(min_score);
    if (max_score !== undefined) updateData.max_score = parseInt(max_score);
    if (active !== undefined) updateData.active = active ? 1 : 0;

    await db("indicators").where({ id }).update(updateData);

    // Update evidence types if provided
    if (evidence_type_ids !== undefined && Array.isArray(evidence_type_ids)) {
      // Delete old mappings
      await db("indicator_evidence").where({ indicator_id: id }).delete();
      // Insert new ones
      for (const evidenceTypeId of evidence_type_ids) {
        await db("indicator_evidence").insert({
          indicator_id: id,
          evidence_type_id: evidenceTypeId,
        });
      }
    }

    const updated = await db("indicators").where({ id }).first();
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

/**
 * DELETE /api/indicators/:id
 * Delete indicator
 */
exports.delete = async (req, res, next) => {
  try {
    const id = req.params.id;

    const row = await db("indicators").where({ id }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: "Indicator not found" });
    }

    // Delete associated evidence mappings first
    await db("indicator_evidence").where({ indicator_id: id }).delete();
    // Delete the indicator
    await db("indicators").where({ id }).delete();

    res.json({ success: true, message: "Indicator deleted" });
  } catch (e) {
    next(e);
  }
};
