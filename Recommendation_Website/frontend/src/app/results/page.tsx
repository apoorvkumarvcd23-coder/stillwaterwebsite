'use client';

import { motion } from 'framer-motion';
import Card from '@/components/Card';
import { CheckCircle2 } from 'lucide-react';

export default function ThankYouPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
            <div className="max-w-md w-full">
                <Card className="text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex justify-center mb-6">
                            <div className="bg-accent/20 p-4 rounded-full">
                                <CheckCircle2 className="w-12 h-12 text-accent" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-heading mb-4 text-white">Details Submitted</h1>
                        <p className="text-gray-300 text-lg leading-relaxed mb-8">
                            Thank you for completing the survey. Our experts will review your profile and contact you with a diagnosis and next steps shortly.
                        </p>
                        <div className="pt-4 border-t border-white/5">
                            <p className="text-sm text-gray-500">
                                You can close this page now. We'll be in touch soon.
                            </p>
                        </div>
                    </motion.div>
                </Card>
            </div>
        </main>
    );
}
