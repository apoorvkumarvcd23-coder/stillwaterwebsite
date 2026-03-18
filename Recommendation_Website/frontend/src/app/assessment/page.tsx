'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import VoiceInput from '@/components/VoiceInput';
import AutoResizeTextarea from '@/components/AutoResizeTextarea';
import TTSButton from '@/components/TTSButton';

const SECTIONS = [
    'Basic Info', 'Diet', 'Lifestyle', 'Health Conditions', 'Symptoms', 'Goals'
];

const TTS_LANGUAGES = {
  'en-IN': 'English',
  'hi-IN': 'हिंदी',
  'gu-IN': 'ગુજરાતી',
  'kn-IN': 'ಕನ್ನಡ',
  'ml-IN': 'മലയാളം',
  'mr-IN': 'मराठी',
  'ta-IN': 'தமிழ்',
  'te-IN': 'తెలుగు',
};

export default function AssessmentPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [isClient, setIsClient] = useState(false);
    const [ttsLanguage, setTtsLanguage] = useState<string>('en-IN');

    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem('wellness_assessment');
        if (saved) {
            setFormData(JSON.parse(saved));
        }
    }, []);

    const updateForm = (key: string, value: any) => {
        setFormData((prev: any) => {
            const newData = { ...prev, [key]: value };
            localStorage.setItem('wellness_assessment', JSON.stringify(newData));
            return newData;
        });
    };

    const handleVoiceResult = (key: string, transcript: string) => {
        setFormData((prev: any) => {
            const currentVal = prev[key] || '';
            const newVal = currentVal ? `${currentVal}. ${transcript}` : transcript;
            const newData = { ...prev, [key]: newVal };
            localStorage.setItem('wellness_assessment', JSON.stringify(newData));
            return newData;
        });
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
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="flex justify-between text-sm text-accent mb-2 font-medium">
                                <span>{SECTIONS[currentStep]}</span>
                                <span>Step {currentStep + 1} of {SECTIONS.length}</span>
                            </div>
                            <ProgressBar progress={((currentStep + 1) / SECTIONS.length) * 100} />
                        </div>
                    </div>
                    
                    {/* Language Selector for TTS */}
                    <div className="mt-4 flex items-center gap-3">
                        <label className="text-sm text-gray-400">🔊 Audio Language:</label>
                        <select
                            value={ttsLanguage}
                            onChange={(e) => setTtsLanguage(e.target.value)}
                            className="bg-background border border-cards p-2 rounded-lg text-sm focus:outline-none focus:border-accent text-gray-300"
                        >
                            {Object.entries(TTS_LANGUAGES).map(([code, name]) => (
                                <option key={code} value={code}>{name}</option>
                            ))}
                        </select>
                    </div>
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
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm text-gray-400">Age</label>
                                                <TTSButton text="Enter your age" label="Age" language={ttsLanguage} />
                                            </div>
                                            <input
                                                type="number" min="1"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.age || ''}
                                                onChange={(e) => updateForm('age', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm text-gray-400">Gender</label>
                                                <TTSButton text="Select your gender" label="Gender" language={ttsLanguage} />
                                            </div>
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
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm text-gray-400">Height (cm)</label>
                                                <TTSButton text="Enter your height in centimeters" label="Height" language={ttsLanguage} />
                                            </div>
                                            <input
                                                type="number" min="1"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.height || ''}
                                                onChange={(e) => updateForm('height', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm text-gray-400">Weight (kg)</label>
                                                <TTSButton text="Enter your weight in kilograms" label="Weight" language={ttsLanguage} />
                                            </div>
                                            <input
                                                type="number" min="1"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.weight || ''}
                                                onChange={(e) => updateForm('weight', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm text-gray-400">Occupation Type</label>
                                            <TTSButton text="Select your occupation type" label="Occupation" language={ttsLanguage} />
                                        </div>
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
                                    <h2 className="text-2xl font-heading mb-6">Tell us about your daily eating habits</h2>
                                    <p className="text-gray-400 -mt-4 mb-6">Describe what and when you eat during a typical day.</p>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm text-gray-400">Breakfast</label>
                                                <div className="flex gap-2">
                                                    <TTSButton text="What do you usually eat for breakfast?" label="Breakfast" language={ttsLanguage} />
                                                    <VoiceInput onResult={(t) => handleVoiceResult('diet_breakfast', t)} />
                                                </div>
                                            </div>
                                            <AutoResizeTextarea
                                                placeholder="What do you usually eat for breakfast?"
                                                rows={2}
                                                value={formData.diet_breakfast || ''}
                                                onChange={(e) => updateForm('diet_breakfast', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm text-gray-400">Lunch</label>
                                                    <div className="flex gap-2">
                                                        <TTSButton text="What do you usually eat for lunch?" label="Lunch" language={ttsLanguage} />
                                                        <VoiceInput onResult={(t) => handleVoiceResult('diet_lunch', t)} />
                                                    </div>
                                                </div>
                                                <AutoResizeTextarea
                                                    placeholder="Typical lunch..."
                                                    rows={2}
                                                    value={formData.diet_lunch || ''}
                                                    onChange={(e) => updateForm('diet_lunch', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm text-gray-400">Dinner</label>
                                                    <div className="flex gap-2">
                                                        <TTSButton text="What do you usually eat for dinner?" label="Dinner" language={ttsLanguage} />
                                                        <VoiceInput onResult={(t) => handleVoiceResult('diet_dinner', t)} />
                                                    </div>
                                                </div>
                                                <AutoResizeTextarea
                                                    placeholder="Typical dinner..."
                                                    rows={2}
                                                    value={formData.diet_dinner || ''}
                                                    onChange={(e) => updateForm('diet_dinner', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm text-gray-400">Snacks</label>
                                                    <div className="flex gap-2">
                                                        <TTSButton text="What snacks do you have?" label="Snacks" language={ttsLanguage} />
                                                        <VoiceInput onResult={(t) => handleVoiceResult('diet_snacks', t)} />
                                                    </div>
                                                </div>
                                                <AutoResizeTextarea
                                                    placeholder="What snacks do you have?"
                                                    rows={2}
                                                    value={formData.diet_snacks || ''}
                                                    onChange={(e) => updateForm('diet_snacks', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm text-gray-400">Snack Time</label>
                                                    <TTSButton text="What time do you have snacks?" label="Snack Time" language={ttsLanguage} />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                    placeholder="e.g., 4 PM, 11 AM"
                                                    value={formData.diet_snacks_time || ''}
                                                    onChange={(e) => updateForm('diet_snacks_time', e.target.value)}
                                                />
                                            </div>
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
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm text-gray-400">When do you go to bed?</label>
                                                <TTSButton text="When do you go to bed?" label="Bed Time" language={ttsLanguage} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="e.g., 10:30 PM"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.bed_time || ''}
                                                onChange={(e) => updateForm('bed_time', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm text-gray-400">When do you get up?</label>
                                                <TTSButton text="When do you get up?" label="Wake Up Time" language={ttsLanguage} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="e.g., 6:30 AM"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.wake_up_time || ''}
                                                onChange={(e) => updateForm('wake_up_time', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm text-gray-400">How many glasses of water do you drink?</label>
                                                <TTSButton text="How many glasses of water do you drink daily?" label="Water Intake" language={ttsLanguage} />
                                            </div>
                                            <input
                                                type="number" min="0"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.water_glasses || ''}
                                                onChange={(e) => updateForm('water_glasses', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm text-gray-400">How much do you exercise?</label>
                                                <div className="flex gap-2">
                                                    <TTSButton text="How much do you exercise?" label="Exercise" language={ttsLanguage} />
                                                    <VoiceInput onResult={(t) => handleVoiceResult('exercise_info', t)} />
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="e.g., 30 min daily, walk 2km"
                                                className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                                                value={formData.exercise_info || ''}
                                                onChange={(e) => updateForm('exercise_info', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SECTION 4: EYE HEALTH */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-heading mb-6">Eye Health</h2>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm text-gray-400">Do you have any existing eye conditions?</label>
                                            <div className="flex gap-2">
                                                <TTSButton text="Do you have any existing eye conditions?" label="Eye Conditions" language={ttsLanguage} />
                                                <VoiceInput onResult={(t) => handleVoiceResult('eye_condition', t)} />
                                            </div>
                                        </div>
                                        <AutoResizeTextarea
                                            placeholder="Please describe any eye issues or conditions"
                                            rows={3}
                                            value={formData.eye_condition || ''}
                                            onChange={(e) => updateForm('eye_condition', e.target.value)}
                                        />
                                    </div>

                                    <div className="bg-background p-4 rounded-lg border border-cards">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="accent-accent w-5 h-5"
                                                checked={formData.wears_spectacles || false}
                                                onChange={(e) => updateForm('wears_spectacles', e.target.checked)}
                                            />
                                            <span className="text-sm md:text-base">I wear spectacles</span>
                                        </label>
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
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm text-gray-400">Describe any other symptoms (Optional)</label>
                                            <TTSButton text="Describe any other symptoms you are experiencing" label="Other Symptoms" language={ttsLanguage} />
                                        </div>
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
                                    <h2 className="text-2xl font-heading mb-6">What are your health goals?</h2>
                                    <p className="text-gray-400 -mt-4">E.g., weight loss, fitness, reversing diabetes, better vision...</p>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm text-gray-400">Tell us about what you want to achieve...</label>
                                            <div className="flex gap-2">
                                                <TTSButton text="Tell us about what health goals you want to achieve" label="Health Goals" language={ttsLanguage} />
                                                <VoiceInput onResult={(t) => handleVoiceResult('health_goals', t)} />
                                            </div>
                                        </div>
                                        <AutoResizeTextarea
                                            placeholder="weight loss, fitness, reversing diabetes..."
                                            rows={4}
                                            value={formData.health_goals || ''}
                                            onChange={(e) => updateForm('health_goals', e.target.value)}
                                        />
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
