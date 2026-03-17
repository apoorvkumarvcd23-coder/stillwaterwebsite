function generateExplanation(matchedRules, service, score) {
    if (score === 0 || !matchedRules || matchedRules.length === 0) {
        return `We recommend ${formatServiceName(service)} based on your general wellness profile. This service aligns strongly with foundational health principles and serves as an excellent starting point for sustainable, long-term vitality.`;
    }

    const reasons = matchedRules
        .filter(r => r.service === service)
        .map(r => {
            if (r.type === 'condition') return `• You mentioned dealing with **${r.attribute}**, which this program is specifically designed to help target and manage naturally.`;
            if (r.type === 'symptom') return `• You are currently experiencing **${r.attribute}**. The techniques and protocols in this program focus on providing deep, lasting relief for these exact symptoms.`;
            if (r.type === 'goal') return `• Your primary goal to **${r.attribute}** perfectly aligns with the proven outcomes this service has delivered for many others.`;
            if (r.type === 'lifestyle') {
                if (r.attribute === 'screen_time_hours' && r.operator === '>') return `• Your high screen time (over ${r.value} hours/day) creates specific strains that our targeted recovery protocols will address.`;
                if (r.attribute === 'stress_level' && r.operator === '>') return `• Your reported stress level (above ${r.value}/10) suggests that our restorative and frequency therapies will be highly beneficial for your nervous system.`;
                if (r.attribute === 'processed_food_frequency') return `• Optimizing your diet and reducing processed foods is a core pillar of this program, which will help drastically boost your energy.`;
                return `• We noted your ${r.attribute.replace(/_/g, ' ')} as a key lifestyle factor that strongly points toward this service.`;
            }
            return '';
        })
        .filter(Boolean);

    const uniqueReasons = [...new Set(reasons)];

    return `Based on a detailed analysis of your health assessment, here is exactly why this is a highly personalized match for you:\n\n${uniqueReasons.join('\n\n')}\n\nWe are confident that ${formatServiceName(service)} will provide the best possible results for your unique profile.`;
}

function formatServiceName(service) {
    const map = {
        SHARAN: 'Sharan Plant-Based Nutrition',
        EYE_YOGA: 'Amar Eye Yoga',
        HEALY: 'Healy Quantum',
        RETREAT: 'Divine Veda Retreat'
    };
    return map[service] || service;
}

module.exports = { generateExplanation };
