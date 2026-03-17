const assessmentData = {
    age: '24',
    gender: 'Male',
    height: '180',
    weight: '75',
    occupation_type: 'Desk job',
    screen_time_hours: '8',
    sleep_hours: '7',
    stress_level: '6',
    water_intake: 'Medium (2L)',
    exercise_frequency: '1-2 times/week',
    diet_type: 'Vegetarian',
    alcohol_frequency: 'Occasional',
    processed_food_frequency: 'Weekly',
    sugar_intake: 'Medium',
    dairy_consumption: 'Moderate',
    conditions: ['Eye strain'],
    symptoms: ['tired eyes'],
    goal_primary: 'improve vision'
};

async function run() {
    try {
        const res = await fetch('http://localhost:3005/api/assessment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assessmentData)
        });
        const data = await res.json();
        console.log('Assessment Response JSON:', data);
        console.log('Details:', data.details);

        if (data.userId) {
            const leadRes = await fetch('http://localhost:3001/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: data.userId, name: 'Aryan', email: 'test@test.com', phone: '123' })
            });
            console.log('Lead Response:', await leadRes.json());

            const recRes = await fetch('http://localhost:3001/api/recommendation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: data.userId })
            });
            console.log('Rec Response:', await recRes.json());
        }
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

run();
