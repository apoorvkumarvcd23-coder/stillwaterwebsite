"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/Button";
import Card from "@/components/Card";

export default function LeadsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill in all fields to see your results.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:3000/recommendation/api";

      // 1. Get assessment data
      const assessmentData = JSON.parse(
        localStorage.getItem("wellness_assessment") || "{}",
      );

      // 2. Submit assessment
      const assessmentRes = await fetch(`${apiBase}/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessmentData),
      });
      if (!assessmentRes.ok) {
        throw new Error("Failed to save assessment");
      }
      const { userId } = await assessmentRes.json();

      if (!userId) throw new Error("Failed to save assessment");

      // 3. Submit leads
      const leadsRes = await fetch(`${apiBase}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...formData }),
      });
      if (!leadsRes.ok) {
        throw new Error("Failed to save contact details");
      }

      // 4. Redirect to confirmation page
      router.push(`/results`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-heading mb-2 text-center text-white">
              Your results are ready!
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Enter your details below to reveal your personalized wellness
              plan.
            </p>

            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="full-name" className="block text-sm text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  id="full-name"
                  type="text"
                  required
                  className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="email-address" className="block text-sm text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email-address"
                  type="email"
                  required
                  className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="phone-number" className="block text-sm text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  required
                  className="w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="pt-4">
                <Button fullWidth type="submit" disabled={loading}>
                  {loading ? "Analyzing Profile..." : "See My Results"}
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-6 text-center">
              By continuing, you agree to receive wellness insights. We respect
              your privacy.
            </p>
          </motion.div>
        </Card>
      </div>
    </main>
  );
}
