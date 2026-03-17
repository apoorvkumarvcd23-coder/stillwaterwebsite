'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import { Users, Activity, Target, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch('http://localhost:3001/api/admin/dashboard')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error);
    }, []);

    if (!stats) {
        return <div className="p-20 text-center text-gray-400">Loading Dashboard...</div>;
    }

    return (
        <div className="min-h-screen p-8 bg-background">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-heading mb-8">Admin Dashboard</h1>

                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <Card>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-2 bg-accent/20 rounded-lg"><Users className="text-accent w-5 h-5" /></div>
                            <h3 className="text-gray-400 font-medium">Total Assessments</h3>
                        </div>
                        <p className="text-4xl font-semibold">{stats.totalAssessments}</p>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-2 bg-accent/20 rounded-lg"><Target className="text-accent w-5 h-5" /></div>
                            <h3 className="text-gray-400 font-medium">Conversion Rate</h3>
                        </div>
                        <p className="text-4xl font-semibold">{stats.conversionRate}%</p>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-2 bg-accent/20 rounded-lg"><Activity className="text-accent w-5 h-5" /></div>
                            <h3 className="text-gray-400 font-medium">Top Issue</h3>
                        </div>
                        <p className="text-xl font-semibold mt-2">{stats.topConditions?.[0]?.[0] || 'N/A'}</p>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-2 bg-accent/20 rounded-lg"><ArrowUpRight className="text-accent w-5 h-5" /></div>
                            <h3 className="text-gray-400 font-medium">Active Users</h3>
                        </div>
                        <p className="text-4xl font-semibold">Live</p>
                    </Card>
                </div>

                <h2 className="text-2xl font-heading mb-6">Top Health Issues Reported</h2>
                <Card>
                    <div className="divide-y divide-white/5">
                        {stats.topConditions?.map((c: any, i: number) => (
                            <div key={i} className="py-4 flex justify-between items-center">
                                <span className="font-medium text-lg">{c[0]}</span>
                                <span className="bg-cards px-3 py-1 rounded-full text-sm">{c[1]} cases</span>
                            </div>
                        ))}
                        {!stats.topConditions?.length && (
                            <p className="py-4 text-gray-500">No data collected yet.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
