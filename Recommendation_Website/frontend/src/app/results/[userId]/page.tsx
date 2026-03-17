"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function ResultsPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.userId) {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:3000/recommendation/api";
      fetch(`${apiBase}/recommendation/${params.userId}`)
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [params.userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-gray-400">Personalizing your wellness plan...</p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">
          Failed to load results. Please try again.
        </p>
      </div>
    );
  }

  const formatName = (service: string) => {
    const map: any = {
      SHARAN: "Sharan Plant-Based Nutrition",
      EYE_YOGA: "Amar Eye Yoga",
      HEALY: "Healy Quantum",
      RETREAT: "Divine Veda Retreat",
    };
    return map[service] || service;
  };

  const getPrice = (service: string) => {
    const map: any = {
      SHARAN: "₹2,500 per consultation",
      EYE_YOGA: "₹1,800 per session",
      HEALY: "₹3,500 per session",
      RETREAT: "₹12,000 per night",
    };
    return map[service] || "";
  };

  const getDescription = (service: string) => {
    const map: any = {
      SHARAN:
        "Dr. Nandita Shah's pioneering organization reverses chronic diseases through whole-food plant-based nutrition.",
      EYE_YOGA:
        "Ancient yogic techniques combined with modern understanding to naturally restore and strengthen vision.",
      HEALY:
        "FDA-cleared German Healy device delivering individualized microcurrent frequency programs for pain, sleep, and mental balance.",
      RETREAT:
        "Immersive Ayurvedic treatments, Panchakarma detox, yoga, and sattvic meals in a nature sanctuary.",
    };
    return map[service] || "";
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-heading mb-4 text-white">
            Your Personalized Wellness Plan
          </h1>
          <p className="text-xl text-gray-300">
            Based on your unique health profile, here is our top recommendation
            for you.
          </p>
        </motion.div>

        {/* Primary Recommendation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-12 border-accent/30 !bg-accent/5" glowOnHover>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-accent/20 text-accent text-xs rounded-full uppercase tracking-wider font-semibold mb-4">
                  #1 Match For You
                </div>
                <h2 className="text-3xl font-heading font-semibold mb-3 text-white">
                  {formatName(data.primary_recommendation)}
                </h2>
                <p className="text-lg text-gray-300 mb-6 font-light">
                  {getDescription(data.primary_recommendation)}
                </p>
                <div className="bg-cards p-6 rounded-xl border border-white/5 mb-8">
                  <h3 className="text-accent font-semibold mb-2">
                    Why we recommend this:
                  </h3>
                  <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {data.primary_explanation}
                  </div>
                </div>
              </div>
              <div className="w-full md:w-72 bg-cards rounded-2xl p-6 text-center shadow-2xl border border-white/10 shrink-0">
                <p className="text-2xl font-semibold mb-2 text-white">
                  {getPrice(data.primary_recommendation)}
                </p>
                <div className="mt-6">
                  <Button
                    fullWidth
                    onClick={() =>
                      (window.location.href =
                        "https://stillwaterwebsite.onrender.com/")
                    }
                  >
                    Book Your Session
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Secondary Recommendation */}
        {data.secondary_recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-heading mb-6 text-center text-gray-300">
              Also Recommended for You
            </h3>
            <Card className="max-w-2xl mx-auto">
              <h4 className="text-2xl font-semibold mb-2">
                {formatName(data.secondary_recommendation)}
              </h4>
              <p className="text-gray-400 mb-4 text-sm">
                {getDescription(data.secondary_recommendation)}
              </p>

              <div className="bg-background/50 p-4 rounded-lg mb-6 text-sm text-gray-300 whitespace-pre-wrap">
                {data.secondary_explanation}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-white">
                  {getPrice(data.secondary_recommendation)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    (window.location.href =
                      "https://stillwaterwebsite.onrender.com/")
                  }
                >
                  Explore Option
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}
