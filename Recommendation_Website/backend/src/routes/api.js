const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const router = express.Router();

const { calculateRecommendation } = require("../services/recommendationEngine");

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

// 1. Save Assessment
router.post("/assessment", async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      occupation_type,
      diet_breakfast,
      diet_lunch,
      diet_dinner,
      diet_snacks,
      diet_snacks_time,
      bed_time,
      wake_up_time,
      water_glasses,
      exercise_info,
      eye_condition,
      wears_spectacles,
      health_goals,
      conditions,
      symptoms,
      goals,
    } = req.body;

    const parsedAge =
      age === undefined || age === null || age === "" ? 0 : parseInt(age, 10);
    const parsedHeight =
      height === undefined || height === null || height === ""
        ? 0
        : parseFloat(height);
    const parsedWeight =
      weight === undefined || weight === null || weight === ""
        ? 0
        : parseFloat(weight);
    const parsedWaterGlasses =
      water_glasses === undefined || water_glasses === null || water_glasses === ""
        ? 0
        : parseInt(water_glasses, 10);

    const user = await prisma.user.create({
      data: {
        age: Number.isFinite(parsedAge) ? parsedAge : 0,
        gender: gender || "",
        height: Number.isFinite(parsedHeight) ? parsedHeight : 0,
        weight: Number.isFinite(parsedWeight) ? parsedWeight : 0,
        occupation_type: occupation_type || "",
        diet_breakfast: diet_breakfast || "",
        diet_lunch: diet_lunch || "",
        diet_dinner: diet_dinner || "",
        diet_snacks: diet_snacks || "",
        diet_snacks_time: diet_snacks_time || "",
        bed_time: bed_time || "",
        wake_up_time: wake_up_time || "",
        water_glasses: Number.isFinite(parsedWaterGlasses) ? parsedWaterGlasses : 0,
        exercise_info: exercise_info || "",
        eye_condition: eye_condition || "",
        wears_spectacles: !!wears_spectacles,
        health_goals: health_goals || "",
        conditions: {
          create: normalizeList(conditions).map((condition) => ({
            condition_name: condition,
          })),
        },
        symptoms: {
          create: normalizeList(symptoms).map((symptom) => ({
            symptom_name: symptom,
          })),
        },
        goals: {
          create: normalizeList(goals).map((goal) => ({
            goal_name: goal,
          })),
        },
      },
      include: {
        conditions: true,
        symptoms: true,
        goals: true,
      },
    });

    res.json({ success: true, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to save assessment",
      details: error.message,
    });
  }
});

// 2. Save Lead Collection Details
router.post("/leads", async (req, res) => {
  try {
    const { userId, name, email, phone } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { name, email, phone },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save lead information" });
  }
});

// 3. Calculate and Save Recommendation
router.post("/recommendation", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      include: { conditions: true, symptoms: true, goals: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const recommendation = await calculateRecommendation(user);
    res.json(recommendation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to calculate recommendation" });
  }
});

// 4. Get Recommendation Results
router.get("/recommendation/:userId", async (req, res) => {
  try {
    const recommendation = await prisma.recommendation.findFirst({
      where: { userId: parseInt(req.params.userId, 10) },
      orderBy: { createdAt: "desc" },
    });

    if (!recommendation) return res.status(404).json({ error: "Not found" });
    res.json(recommendation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch recommendation" });
  }
});

// 5. Admin Dashboard Analytics
router.get("/admin/dashboard", async (_req, res) => {
  try {
    const totalAssessments = await prisma.user.count();
    const withEmails = await prisma.user.count({ where: { email: { not: null } } });

    const conditions = await prisma.userCondition.findMany();
    const counts = {};
    conditions.forEach((condition) => {
      counts[condition.condition_name] = (counts[condition.condition_name] || 0) + 1;
    });
    const topConditions = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    res.json({
      totalAssessments,
      conversionRate: totalAssessments
        ? Math.round((withEmails / totalAssessments) * 100)
        : 0,
      topConditions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed dashboard stats" });
  }
});

module.exports = router;
