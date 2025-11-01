"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Users, Store, List, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Dummy stats data
const stats = [
  {
    name: "Users",
    value: 1200,
    icon: Users,
    color: "text-blue-600",
  },
  {
    name: "Sellers",
    value: 85,
    icon: Store,
    color: "text-green-600",
  },
  {
    name: "Listings",
    value: 450,
    icon: List,
    color: "text-purple-600",
  },
  {
    name: "Revenue",
    value: "$12,400",
    icon: DollarSign,
    color: "text-yellow-600",
  },
];

// Dummy chart data
const chartData = [
  { month: "Jan", listings: 30 },
  { month: "Feb", listings: 45 },
  { month: "Mar", listings: 60 },
  { month: "Apr", listings: 80 },
  { month: "May", listings: 50 },
  { month: "Jun", listings: 70 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Listings Created per Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip />
                <Bar dataKey="listings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
