-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "age" INTEGER NOT NULL DEFAULT 0,
    "gender" TEXT NOT NULL DEFAULT '',
    "height" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "occupation_type" TEXT NOT NULL DEFAULT '',
    "screen_time_hours" INTEGER NOT NULL DEFAULT 0,
    "sleep_hours" INTEGER NOT NULL DEFAULT 0,
    "stress_level" INTEGER NOT NULL DEFAULT 0,
    "water_intake" TEXT NOT NULL DEFAULT '',
    "exercise_frequency" TEXT NOT NULL DEFAULT '',
    "diet_type" TEXT NOT NULL DEFAULT '',
    "alcohol_frequency" TEXT NOT NULL DEFAULT '',
    "smoking" TEXT NOT NULL DEFAULT '',
    "processed_food_frequency" TEXT NOT NULL DEFAULT '',
    "sugar_intake" TEXT NOT NULL DEFAULT '',
    "dairy_consumption" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGoal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "goal_name" TEXT NOT NULL,

    CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCondition" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "condition_name" TEXT NOT NULL,

    CONSTRAINT "UserCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSymptom" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "symptom_name" TEXT NOT NULL,

    CONSTRAINT "UserSymptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sharan_score" INTEGER NOT NULL,
    "eye_yoga_score" INTEGER NOT NULL,
    "healy_score" INTEGER NOT NULL,
    "retreat_score" INTEGER NOT NULL,
    "primary_recommendation" TEXT NOT NULL,
    "secondary_recommendation" TEXT,
    "primary_explanation" TEXT,
    "secondary_explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRule" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
    "value" TEXT,
    "operator" TEXT,
    "service" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "ServiceRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCondition" ADD CONSTRAINT "UserCondition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSymptom" ADD CONSTRAINT "UserSymptom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

