const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateExplanation } = require('./explanationEngine');

async function calculateRecommendation(user) {
    const rules = await prisma.serviceRule.findMany();

    let scores = {
        SHARAN: 0,
        EYE_YOGA: 0,
        HEALY: 0,
        RETREAT: 0
    };

    const matchedRules = []; // For the explanation engine

    for (const rule of rules) {
        let matched = false;

        if (rule.type === 'condition') {
            matched = user.conditions.some(c => c.condition_name.toLowerCase() === rule.attribute.toLowerCase());
        } else if (rule.type === 'symptom') {
            matched = user.symptoms.some(s => s.symptom_name.toLowerCase() === rule.attribute.toLowerCase());
        } else if (rule.type === 'goal') {
            matched = (user.goals || []).some(g => g.goal_name.toLowerCase() === rule.attribute.toLowerCase());
        } else if (rule.type === 'lifestyle') {
            const userVal = user[rule.attribute]; // e.g., user.stress_level
            if (userVal !== undefined && userVal !== null) {
                if (rule.operator === '>') {
                    matched = Number(userVal) > Number(rule.value);
                } else if (rule.operator === '==') {
                    matched = String(userVal).toLowerCase() === String(rule.value).toLowerCase();
                }
            }
        }

        if (matched) {
            scores[rule.service] += rule.score;
            matchedRules.push(rule);
        }
    }

    // Determine top two services
    const sortedServices = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    const primary = sortedServices[0][0];
    const secondary = sortedServices[1][0];

    const primary_explanation = generateExplanation(matchedRules, primary, scores[primary]);
    const secondary_explanation = generateExplanation(matchedRules, secondary, scores[secondary]);

    const recommendation = await prisma.recommendation.create({
        data: {
            userId: user.id,
            sharan_score: scores.SHARAN,
            eye_yoga_score: scores.EYE_YOGA,
            healy_score: scores.HEALY,
            retreat_score: scores.RETREAT,
            primary_recommendation: primary,
            secondary_recommendation: secondary,
            primary_explanation,
            secondary_explanation
        }
    });

    return recommendation;
}

module.exports = { calculateRecommendation };
