import React, { useMemo, useState } from "react";
import { Activity, Dumbbell, Scale, Trash2, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const seedData = [
  {
    id: 1,
    date: "2026-03-01",
    weight: 55,
    height: 162,
    musclePercent: 31.2,
    fatPercent: 27.8,
    bmi: 20.96,
  },
  {
    id: 2,
    date: "2026-03-08",
    weight: 54.6,
    height: 162,
    musclePercent: 31.8,
    fatPercent: 27.1,
    bmi: 20.8,
  },
  {
    id: 3,
    date: "2026-03-15",
    weight: 54.2,
    height: 162,
    musclePercent: 32.4,
    fatPercent: 26.4,
    bmi: 20.65,
  },
];

function getBmiCategory(bmi) {
  if (bmi < 18.5) {
    return {
      label: "น้ำหนักน้อย",
      className: "bg-blue-100 text-blue-700",
    };
  }
  if (bmi < 23) {
    return {
      label: "สมส่วน",
      className: "bg-green-100 text-green-700",
    };
  }
  if (bmi < 25) {
    return {
      label: "น้ำหนักเกิน",
      className: "bg-yellow-100 text-yellow-700",
    };
  }
  if (bmi < 30) {
    return {
      label: "อ้วนระดับ 1",
      className: "bg-orange-100 text-orange-700",
    };
  }
  return {
    label: "อ้วนระดับ 2",
    className: "bg-red-100 text-red-700",
  };
}

function SummaryCard({ title, value, helper, Icon }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{helper}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon className="h-6 w-6 text-slate-700" />
        </div>
      </div>
    </div>
  );
}

export default function BMITrackerMockup() {
  const [records, setRecords] = useState(seedData);
  const [activeTab, setActiveTab] = useState("chart");
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    weight: "",
    height: "162",
    musclePercent: "",
    fatPercent: "",
  });

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);

  const latestRecord = sortedRecords[sortedRecords.length - 1];

  const chartData = sortedRecords.map((item) => ({
    date: item.date.slice(5),
    BMI: Number(item.bmi.toFixed(2)),
    muscle: item.musclePercent,
    fat: item.fatPercent,
  }));

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleAddRecord() {
    const weight = Number(form.weight);
    const height = Number(form.height);
    const musclePercent = Number(form.musclePercent);
    const fatPercent = Number(form.fatPercent);

    if (!form.date || !weight || !height) {
      alert("กรุณากรอกวันที่ น้ำหนัก และส่วนสูง");
      return;
    }

    if (musclePercent < 0 || fatPercent < 0) {
      alert("เปอร์เซ็นต์ต้องไม่ติดลบ");
      return;
    }

    const bmi = weight / Math.pow(height / 100, 2);

    const newRecord = {
      id: Date.now(),
      date: form.date,
      weight,
      height,
      musclePercent,
      fatPercent,
      bmi,
    };

    setRecords((prev) => [...prev, newRecord]);

    setForm({
      date: new Date().toISOString().slice(0, 10),
      weight: "",
      height: String(height),
      musclePercent: "",
      fatPercent: "",
    });
  }

  function handleDelete(id) {
    setRecords((prev) => prev.filter((item) => item.id !== id));
  }

  const summaryCards = latestRecord
    ? [
        {
          title: "BMI ล่าสุด",
          value: latestRecord.bmi.toFixed(2),
          helper: getBmiCategory(latestRecord.bmi).label,
          icon: Activity,
        },
        {
          title: "% กล้ามเนื้อ",
          value: `${latestRecord.musclePercent.toFixed(1)}%`,
          helper: "ค่าล่าสุด",
          icon: Dumbbell,
        },
        {
          title: "% ไขมัน",
          value: `${latestRecord.fatPercent.toFixed(1)}%`,
          helper: "ค่าล่าสุด",
          icon: Scale,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Health Tracker
            </h1>
            <p className="text-sm text-slate-500">
              บันทึก BMI, เปอร์เซ็นต์กล้ามเนื้อ, เปอร์เซ็นต์ไขมัน และดูกราฟเทรนด์ย้อนหลัง
            </p>
          </div>

          {latestRecord && (
            <div
              className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${getBmiCategory(latestRecord.bmi).className}`}
            >
              สถานะล่าสุด: {getBmiCategory(latestRecord.bmi).label}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <SummaryCard
              key={card.title}
              title={card.title}
              value={card.value}
              helper={card.helper}
              Icon={card.icon}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="border-b p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                บันทึกข้อมูลใหม่
              </h2>
            </div>

            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">วันที่</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">น้ำหนัก (กก.)</label>
                <input
                  type="number"
                  placeholder="เช่น 54.5"
                  value={form.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">ส่วนสูง (ซม.)</label>
                <input
                  type="number"
                  placeholder="เช่น 162"
                  value={form.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  เปอร์เซ็นต์กล้ามเนื้อ
                </label>
                <input
                  type="number"
                  placeholder="เช่น 32.4"
                  value={form.musclePercent}
                  onChange={(e) => handleChange("musclePercent", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  เปอร์เซ็นต์ไขมัน
                </label>
                <input
                  type="number"
                  placeholder="เช่น 26.4"
                  value={form.fatPercent}
                  onChange={(e) => handleChange("fatPercent", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
                />
              </div>

              <button
                onClick={handleAddRecord}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-800"
              >
                เพิ่มข้อมูล
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm">
              <button
                onClick={() => setActiveTab("chart")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  activeTab === "chart"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                กราฟเทรนด์
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  activeTab === "history"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                ประวัติ
              </button>
            </div>

            {activeTab === "chart" && (
              <div className="rounded-2xl bg-white shadow-sm">
                <div className="border-b p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <TrendingUp className="h-5 w-5" />
                    แนวโน้มสุขภาพย้อนหลัง
                  </h2>
                </div>

                <div className="p-6">
                  <div className="h-[420px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="BMI"
                          name="BMI"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="muscle"
                          name="% กล้ามเนื้อ"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="fat"
                          name="% ไขมัน"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "product" && (
              <div className="rounded-2xl bg-white shadow-sm">
                <div className="border-b p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    สินค้าเชื่อม All Online
                  </h2>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="rounded-2xl bg-white shadow-sm">
                <div className="border-b p-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    ประวัติการบันทึก
                  </h2>
                </div>

                <div className="overflow-x-auto p-6">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 font-medium">วันที่</th>
                        <th className="pb-3 font-medium">น้ำหนัก</th>
                        <th className="pb-3 font-medium">ส่วนสูง</th>
                        <th className="pb-3 font-medium">BMI</th>
                        <th className="pb-3 font-medium">% กล้ามเนื้อ</th>
                        <th className="pb-3 font-medium">% ไขมัน</th>
                        <th className="pb-3 text-right font-medium">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRecords.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-4 text-sm text-slate-700">{item.date}</td>
                          <td className="py-4 text-sm text-slate-700">{item.weight} กก.</td>
                          <td className="py-4 text-sm text-slate-700">{item.height} ซม.</td>
                          <td className="py-4 text-sm text-slate-700">{item.bmi.toFixed(2)}</td>
                          <td className="py-4 text-sm text-slate-700">
                            {item.musclePercent.toFixed(1)}%
                          </td>
                          <td className="py-4 text-sm text-slate-700">
                            {item.fatPercent.toFixed(1)}%
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}