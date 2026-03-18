const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const normalizeToStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  return [];
};

async function test() {
  const reqBody = {};

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
      conditions: providedConditions,
      symptoms: providedSymptoms,
      goals: providedGoals,
    } = reqBody;

    const conditions = Array.from(new Set(normalizeToStringArray(providedConditions)));
    const symptoms = Array.from(new Set(normalizeToStringArray(providedSymptoms)));
    const goals = Array.from(new Set(normalizeToStringArray(providedGoals)));

    console.log("Creating user with data...");
    
    const user = await prisma.user.create({
      data: {
        age: age ? parseInt(age) : 0,
        gender: gender || "",
        height: height ? parseFloat(height) : 0,
        weight: weight ? parseFloat(weight) : 0,
        occupation_type: occupation_type || "",
        diet_breakfast: diet_breakfast || "",
        diet_lunch: diet_lunch || "",
        diet_dinner: diet_dinner || "",
        diet_snacks: diet_snacks || "",
        diet_snacks_time: diet_snacks_time || "",
        bed_time: bed_time || "",
        wake_up_time: wake_up_time || "",
        water_glasses: water_glasses ? parseInt(water_glasses) : 0,
        exercise_info: exercise_info || "",
        eye_condition: eye_condition || "",
        wears_spectacles: !!wears_spectacles,
        health_goals: health_goals || "",

        conditions: {
          create: conditions.map((c) => ({ condition_name: c })),
        },
        symptoms: {
          create: symptoms.map((s) => ({ symptom_name: s })),
        },
        goals: {
          create: goals.map((g) => ({ goal_name: g })),
        },
      },
      include: {
        conditions: true,
        symptoms: true,
        goals: true,
      },
    });

    console.log("Successfully created user", user);
  } catch (error) {
    console.error("Prisma error:", error);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
