const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

const { calculateRecommendation } = require('../services/recommendationEngine');

// 1. Save Assessment
router.post('/assessment', async (req, res) => {
    try {
        const {
            age, gender, height, weight, occupation_type, screen_time_hours, sleep_hours,
            stress_level, water_intake, exercise_frequency, diet_type, alcohol_frequency,
            smoking, processed_food_frequency, sugar_intake, dairy_consumption, goal_primary, goal_secondary,
            conditions, symptoms, goals
        } = req.body;

        const user = await prisma.user.create({
            data: {
                age: age ? parseInt(age) : 0,
                gender: gender || "",
                height: height ? parseFloat(height) : 0,
                weight: weight ? parseFloat(weight) : 0,
                occupation_type: occupation_type || "",
                screen_time_hours: screen_time_hours ? parseInt(screen_time_hours) : 0,
                sleep_hours: sleep_hours ? parseInt(sleep_hours) : 0,
                stress_level: stress_level ? parseInt(stress_level) : 0,
                water_intake: water_intake || "",
                exercise_frequency: exercise_frequency || "",
                diet_type: diet_type || "",
                alcohol_frequency: alcohol_frequency || "",
                smoking: smoking || "",
                processed_food_frequency: processed_food_frequency || "",
                sugar_intake: sugar_intake || "",
                dairy_consumption: dairy_consumption || "",
                conditions: {
                    create: (conditions || []).map(c => ({ condition_name: c }))
                },
                symptoms: {
                    create: (symptoms || []).map(s => ({ symptom_name: s }))
                },
                goals: {
                    create: (goals || []).map(g => ({ goal_name: g }))
                }
            },
            include: {
                conditions: true,
                symptoms: true,
                goals: true
            }
        });

        res.json({ success: true, userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save assessment', details: error.message });
    }
});

// 2. Save Lead Collection Details
router.post('/leads', async (req, res) => {
    try {
        const { userId, name, email, phone } = req.body;
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { name, email, phone }
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save lead information' });
    }
});

// 3. Calculate and Save Recommendation
router.post('/recommendation', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: { conditions: true, symptoms: true, goals: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const recommendation = await calculateRecommendation(user);
        res.json(recommendation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate recommendation' });
    }
});

// 4. Get Recommendation Results
router.get('/recommendation/:userId', async (req, res) => {
    try {
        const recommendation = await prisma.recommendation.findFirst({
            where: { userId: parseInt(req.params.userId) },
            orderBy: { createdAt: 'desc' }
        });

        if (!recommendation) return res.status(404).json({ error: 'Not found' });
        res.json(recommendation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch recommendation' });
    }
});

// 5. Admin Dashboard Analytics
router.get('/admin/dashboard', async (req, res) => {
    try {
        const totalAssessments = await prisma.user.count();
        const withEmails = await prisma.user.count({ where: { email: { not: null } } });

        // Simplistic aggregations manually since SQLite lacks certain aggregations
        // For Production / Postgres, you'd use groupBy. Let's use simple logic here.
        const conditions = await prisma.userCondition.findMany();
        const counts = {};
        conditions.forEach(c => {
            counts[c.condition_name] = (counts[c.condition_name] || 0) + 1;
        });
        const topConditions = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        res.json({
            totalAssessments,
            conversionRate: totalAssessments ? Math.round((withEmails / totalAssessments) * 100) : 0,
            topConditions
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed dashboard stats' });
    }
});

module.exports = router;
