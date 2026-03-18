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
            let userVal = user[rule.attribute];

            // Inferences for new fields
            if (rule.attribute === 'stress_level' && (userVal === 0 || userVal === undefined)) {
                // Infer stress from extracted symptoms
                const stressfulSymptoms = ['constant stress', 'burnout', 'insomnia', 'anxiety'];
                const hasStress = user.symptoms.some(s => stressfulSymptoms.includes(s.symptom_name.toLowerCase()));
                if (hasStress) userVal = 8; // High stress inference
            }

            if (rule.attribute === 'processed_food_frequency' && (!userVal || userVal === "")) {
                // Infer from diet descriptions
                const dietText = `${user.diet_breakfast} ${user.diet_lunch} ${user.diet_dinner} ${user.diet_snacks}`.toLowerCase();
                if (dietText.includes('processed') || dietText.includes('packaged') || dietText.includes('junk') || dietText.includes('ready to eat')) {
                    userVal = 'daily';
                }
            }

            if (rule.attribute === 'screen_time_hours' && (userVal === 0 || userVal === undefined)) {
                if (user.occupation_type === 'Desk job') userVal = 8;
                else if (user.occupation_type === 'Student') userVal = 6;
            }

            if (rule.attribute === 'water_intake' && (!userVal || userVal === "")) {
                if (user.water_glasses > 0) {
                    if (user.water_glasses < 4) userVal = "Low (1L)";
                    else if (user.water_glasses < 8) userVal = "Medium (2L)";
                    else userVal = "High (3L+)";
                }
            }

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
