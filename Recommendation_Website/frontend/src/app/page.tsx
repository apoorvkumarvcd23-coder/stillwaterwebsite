'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { CheckCircle, Activity, Heart, Shield } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 max-w-7xl mx-auto">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-heading font-bold mb-6 tracking-tight text-white"
          >
            Discover Your Personalized <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-teal-400">Wellness Path</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 font-light"
          >
            Take our 2-minute wellness assessment and get personalized recommendations based on your unique health profile.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button size="lg" onClick={() => router.push('/assessment')}>
              Start Assessment
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-cards/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: 'Take the Assessment', desc: 'Answer questions about your diet, lifestyle, and goals.' },
              { icon: Shield, title: 'AI-Powered Analysis', desc: 'Our recommendation engine identifies the best path for you.' },
              { icon: CheckCircle, title: 'Get Recommendations', desc: 'Receive tailored wellness services matched to your needs.' }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-center mb-16">Our Wellness Services</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card glowOnHover>
              <Heart className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Plant-Based Nutrition</h3>
              <p className="text-gray-300 mb-4">Reverse chronic diseases through whole-food plant-based nutrition and lifestyle medicine.</p>
            </Card>
            <Card glowOnHover>
              <Activity className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Eye Yoga & Vision Healing</h3>
              <p className="text-gray-300 mb-4">Ancient yogic techniques combined with modern understanding to naturally restore vision.</p>
            </Card>
            <Card glowOnHover>
              <Shield className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Bioenergetic Therapy</h3>
              <p className="text-gray-300 mb-4">FDA-cleared microcurrent frequency programs for pain, sleep, and mental balance.</p>
            </Card>
            <Card glowOnHover>
              <CheckCircle className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Ayurveda Retreat</h3>
              <p className="text-gray-300 mb-4">Immersive Ayurvedic treatments and Panchakarma detox in a nature sanctuary.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer / Disclaimer */}
      <footer className="border-t border-cards py-8 text-center text-sm text-gray-500 px-4">
        <p>This wellness assessment provides lifestyle recommendations and does not constitute medical advice.</p>
        <p className="mt-2">© {new Date().getFullYear()} Stillwater Wellness. All rights reserved.</p>
      </footer>
    </main>
  );
}
