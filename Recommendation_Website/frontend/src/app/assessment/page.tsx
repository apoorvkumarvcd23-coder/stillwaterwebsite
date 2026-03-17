'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';

const SECTIONS = [
    'Basic Info', 'Diet', 'Lifestyle', 'Health Conditions', 'Symptoms', 'Goals'
];

export default function AssessmentPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem('wellness_assessment');
        if (saved) {
            setFormData(JSON.parse(saved));
        }
    }, []);

    const updateForm = (key: string, value: any) => {
        const newData = { ...formData, [key]: value };
        setFormData(newData);
        localStorage.setItem('wellness_assessment', JSON.stringify(newData));
    };

    const nextStep = () => {
        if (currentStep < SECTIONS.length - 1) {
            setCurrentStep(curr => curr + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            router.push('/leads');
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCheckbox = (key: string, value: string) => {
        const list = formData[key] || [];
        if (list.includes(value)) {
            updateForm(key, list.filter((i: string) => i !== value));
        } else {
            updateForm(key, [...list, value]);
        }
    };

    if (!isClient) return null; // Avoid hydration mismatch

    return (
        <main className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Progress Header */}
                <div className="mb-12">
                    <div className="flex justify-between text-sm text-accent mb-2 font-medium">
                        <span>{SECTIONS[currentStep]}</span>
                        <span>Step {currentStep + 1} of {SECTIONS.length}</span>
                    </div>
                    <ProgressBar progress={((currentStep + 1) / SECTIONS.length) * 100} />
                </div>

                {/* Steps Content */}
                <Card className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >

                            {/* SECTION 1: BASIC INFO */}
                            {currentStep === 0 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-heading mb-6">Let's start with the basics</h2>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Age</label>
                                            <input
                                                type="number" min="1"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.age || ''}
                                                onChange={(e) => updateForm('age', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Gender</label>
                                            <select
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.gender || ''}
                                                onChange={(e) => updateForm('gender', e.target.value)}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Height (cm)</label>
                                            <input
                                                type="number" min="1"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.height || ''}
                                                onChange={(e) => updateForm('height', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
                                            <input
                                                type="number" min="1"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.weight || ''}
                                                onChange={(e) => updateForm('weight', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Occupation Type</label>
                                        <div className="flex gap-4 flex-wrap">
                                            {['Desk job', 'Physical work', 'Student'].map(occ => (
                                                <label key={occ} className="flex items-center gap-2 cursor-pointer bg-background p-3 rounded-lg border border-cards hover:border-accent transition-colors flex-1 min-w-[120px]">
                                                    <input
                                                        type="radio"
                                                        name="occupation"
                                                        value={occ}
                                                        checked={formData.occupation_type === occ}
                                                        onChange={(e) => updateForm('occupation_type', e.target.value)}
                                                        className="accent-accent"
                                                    />
                                                    {occ}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SECTION 2: DIET */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-heading mb-6">Tell us about your diet</h2>

                                    {/* Diet Type */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Diet Type</label>
                                        <div className="flex gap-4 flex-wrap">
                                            {['Vegan', 'Vegetarian', 'Non-vegetarian'].map(diet => (
                                                <label key={diet} className="flex items-center gap-2 cursor-pointer bg-background p-3 rounded-lg border border-cards hover:border-accent transition-colors flex-1 min-w-[120px]">
                                                    <input
                                                        type="radio" name="diet" value={diet}
                                                        checked={formData.diet_type === diet}
                                                        onChange={(e) => updateForm('diet_type', e.target.value)}
                                                        className="accent-accent"
                                                    />
                                                    {diet}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Processed Food */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Processed Food</label>
                                            <select
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.processed_food_frequency || ''}
                                                onChange={(e) => updateForm('processed_food_frequency', e.target.value)}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Never">Never</option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="Daily">Daily</option>
                                            </select>
                                        </div>

                                        {/* Sugar */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Sugar Intake</label>
                                            <select
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.sugar_intake || ''}
                                                onChange={(e) => updateForm('sugar_intake', e.target.value)}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>

                                        {/* Dairy */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Dairy Consumption</label>
                                            <select
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.dairy_consumption || ''}
                                                onChange={(e) => updateForm('dairy_consumption', e.target.value)}
                                            >
                                                <option value="">Select...</option>
                                                <option value="None">None</option>
                                                <option value="Moderate">Moderate</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>

                                        {/* Alcohol */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Alcohol Consumption</label>
                                            <select
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.alcohol_frequency || ''}
                                                onChange={(e) => updateForm('alcohol_frequency', e.target.value)}
                                            >
                                                <option value="">Select...</option>
                                                <option value="None">None</option>
                                                <option value="Occasional">Occasional</option>
                                                <option value="Frequent">Frequent</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SECTION 3: LIFESTYLE */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-heading mb-6">Your daily lifestyle</h2>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Sleep hours (per night)</label>
                                            <input
                                                type="number" min="0" max="24"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.sleep_hours || ''}
                                                onChange={(e) => updateForm('sleep_hours', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Screen time (hours per day)</label>
                                            <input
                                                type="number" min="0" max="24"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.screen_time_hours || ''}
                                                onChange={(e) => updateForm('screen_time_hours', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Stress Level: {formData.stress_level || 5} (1-10)</label>
                                        <input
                                            type="range" min="1" max="10"
                                            className="w-full accent-accent"
                                            value={formData.stress_level || 5}
                                            onChange={(e) => updateForm('stress_level', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Water intake</label>
                                            <select
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.water_intake || ''}
                                                onChange={(e) => updateForm('water_intake', e.target.value)}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Low (1L)">Low (&lt;1L)</option>
                                                <option value="Medium (2L)">Medium (~2L)</option>
                                                <option value="High (3L+)">High (3L+)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Exercise frequency</label>
                                            <select
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.exercise_frequency || ''}
                                                onChange={(e) => updateForm('exercise_frequency', e.target.value)}
                                            >
                                                <option value="">Select...</option>
                                                <option value="None">None</option>
                                                <option value="1-2 times/week">1-2 times/week</option>
                                                <option value="3+ times/week">3+ times/week</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SECTION 4: HEALTH CONDITIONS */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-heading mb-6">Select any existing conditions</h2>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {['Diabetes', 'Heart disease', 'Obesity', 'Autoimmune disease', 'Myopia', 'Hyperopia', 'Eye strain', 'Chronic pain', 'Sleep disorder', 'Anxiety', 'Fatigue', 'Digestive issues', 'None'].map(condition => (
                                            <label key={condition} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="accent-accent w-4 h-4"
                                                    checked={(formData.conditions || []).includes(condition)}
                                                    onChange={() => handleCheckbox('conditions', condition)}
                                                />
                                                {condition}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SECTION 5: SYMPTOMS */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-heading mb-6">What symptoms are you experiencing?</h2>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                        {['tired eyes', 'blurred vision', 'headaches', 'insomnia', 'body pain', 'constant stress', 'low energy', 'burnout'].map(s => (
                                            <label key={s} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="accent-accent w-4 h-4"
                                                    checked={(formData.symptoms || []).includes(s)}
                                                    onChange={() => handleCheckbox('symptoms', s)}
                                                />
                                                <span className="capitalize">{s}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Describe any other symptoms (Optional AI analysis)</label>
                                        <textarea
                                            className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent h-24"
                                            placeholder="E.g., My eyes hurt after long coding sessions"
                                            value={formData.symptom_text || ''}
                                            onChange={(e) => updateForm('symptom_text', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {/* SECTION 6: GOALS */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-heading mb-6">What are your primary goals? (Select up to 3)</h2>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {['lose weight', 'reverse disease', 'improve vision', 'reduce stress', 'sleep better', 'detox', 'increase energy'].map(goal => {
                                            const isSelected = (formData.goals || []).includes(goal);
                                            const isMaxReached = (formData.goals || []).length >= 3;
                                            return (
                                                <label key={goal} className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'} ${!isSelected && isMaxReached ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="accent-accent w-4 h-4"
                                                        checked={isSelected}
                                                        disabled={!isSelected && isMaxReached}
                                                        onChange={() => handleCheckbox('goals', goal)}
                                                    />
                                                    <span className="capitalize">{goal}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="mt-12 flex justify-between pt-6 border-t border-cards">
                        <Button
                            variant="secondary"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={currentStep === 0 ? 'invisible' : ''}
                        >
                            Back
                        </Button>

                        <Button onClick={nextStep}>
                            {currentStep === SECTIONS.length - 1 ? 'Complete Assessment' : 'Continue'}
                        </Button>
                    </div>
                </Card>
            </div>
        </main>
    );
}
