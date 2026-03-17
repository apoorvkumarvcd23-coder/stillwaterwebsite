const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.serviceRule.deleteMany();

    const rules = [
        // SHARAN SCORING
        { type: 'condition', attribute: 'Diabetes', service: 'SHARAN', score: 5 },
        { type: 'condition', attribute: 'Heart disease', service: 'SHARAN', score: 5 },
        { type: 'condition', attribute: 'Obesity', service: 'SHARAN', score: 4 },
        { type: 'condition', attribute: 'Digestive issues', service: 'SHARAN', score: 3 },
        { type: 'lifestyle', attribute: 'processed_food_frequency', value: 'daily', operator: '==', service: 'SHARAN', score: 3 },
        { type: 'goal', attribute: 'lose weight', service: 'SHARAN', score: 2 },
        { type: 'goal', attribute: 'reverse disease', service: 'SHARAN', score: 4 },

        // EYE YOGA SCORING
        { type: 'lifestyle', attribute: 'screen_time_hours', value: '6', operator: '>', service: 'EYE_YOGA', score: 3 },
        { type: 'condition', attribute: 'Eye strain', service: 'EYE_YOGA', score: 5 },
        { type: 'condition', attribute: 'Myopia', service: 'EYE_YOGA', score: 5 },
        { type: 'condition', attribute: 'Hyperopia', service: 'EYE_YOGA', score: 5 },
        { type: 'symptom', attribute: 'tired eyes', service: 'EYE_YOGA', score: 3 },
        { type: 'symptom', attribute: 'blurred vision', service: 'EYE_YOGA', score: 4 },
        { type: 'goal', attribute: 'improve vision', service: 'EYE_YOGA', score: 5 },

        // HEALY SCORING
        { type: 'condition', attribute: 'Anxiety', service: 'HEALY', score: 4 },
        { type: 'condition', attribute: 'Sleep disorder', service: 'HEALY', score: 5 },
        { type: 'condition', attribute: 'Fatigue', service: 'HEALY', score: 3 },
        { type: 'condition', attribute: 'Chronic pain', service: 'HEALY', score: 5 },
        { type: 'symptom', attribute: 'insomnia', service: 'HEALY', score: 4 },
        { type: 'symptom', attribute: 'low energy', service: 'HEALY', score: 3 },
        { type: 'goal', attribute: 'increase energy', service: 'HEALY', score: 3 },

        // RETREAT SCORING
        { type: 'lifestyle', attribute: 'stress_level', value: '7', operator: '>', service: 'RETREAT', score: 4 },
        { type: 'symptom', attribute: 'burnout', service: 'RETREAT', score: 5 },
        { type: 'goal', attribute: 'detox', service: 'RETREAT', score: 4 },
        { type: 'goal', attribute: 'lifestyle reset', service: 'RETREAT', score: 3 },
        { type: 'symptom', attribute: 'constant stress', service: 'RETREAT', score: 4 }
    ];

    for (const rule of rules) {
        await prisma.serviceRule.create({ data: rule });
    }

    console.log('Seed completed successfully via JS.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
