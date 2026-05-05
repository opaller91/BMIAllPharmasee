import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Battery,
  Brain,
  ChevronRight,
  Eye,
  Moon,
  Scale,
  Shield,
  ShoppingBag,
  Sparkles,
  Trash2,
  Dumbbell,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STORAGE_KEY = "health-tracker-records-v1";
const BRAND_BLUE = "#005ba8";

const lifestyleQuestions = [
  {
    key: "concern",
    title: "ช่วงนี้อยากดูแลเรื่องไหนที่สุด?",
    options: [
      { value: "tired", label: "อ่อนเพลียง่าย" },
      { value: "sleep", label: "นอนหลับไม่ดี" },
      { value: "immunity", label: "ภูมิคุ้มกัน" },
      { value: "eye", label: "ใช้สายตาเยอะ" },
      { value: "skin", label: "ผิว / ความสดใส" },
      { value: "bone", label: "กระดูก / ข้อ" },
    ],
  },
  {
    key: "sleep",
    title: "โดยเฉลี่ยนอนเป็นยังไง?",
    options: [
      { value: "low", label: "น้อยกว่า 6 ชม." },
      { value: "normal", label: "6-8 ชม." },
      { value: "good", label: "หลับดี พักพอ" },
    ],
  },
  {
    key: "stress",
    title: "ระดับความเครียดช่วงนี้?",
    options: [
      { value: "low", label: "น้อย" },
      { value: "medium", label: "ปานกลาง" },
      { value: "high", label: "สูง" },
    ],
  },
  {
    key: "screenTime",
    title: "ใช้หน้าจอนานไหม?",
    options: [
      { value: "low", label: "ไม่มาก" },
      { value: "medium", label: "ปานกลาง" },
      { value: "high", label: "นานมาก" },
    ],
  },
  {
    key: "diet",
    title: "พฤติกรรมการกิน?",
    options: [
      { value: "normal", label: "กินค่อนข้างครบ" },
      { value: "irregular", label: "กินไม่เป็นเวลา" },
      { value: "lowProtein", label: "โปรตีนน้อย" },
      { value: "sweet", label: "หวานบ่อย" },
    ],
  },
  {
    key: "exercise",
    title: "ออกกำลังกายบ่อยแค่ไหน?",
    options: [
      { value: "low", label: "แทบไม่ออก" },
      { value: "sometimes", label: "บ้างบางวัน" },
      { value: "regular", label: "สม่ำเสมอ" },
    ],
  },
];

const seedRecords = [
  {
    id: 1,
    date: "2026-03-01",
    weight: 55,
    height: 162,
    bmi: 20.96,
    musclePercent: 31.2,
    fatPercent: 27.8,
    lifestyle: {
      concern: "tired",
      sleep: "normal",
      stress: "high",
      screenTime: "high",
      diet: "lowProtein",
      exercise: "sometimes",
    },
  },
  {
    id: 2,
    date: "2026-03-08",
    weight: 54.6,
    height: 162,
    bmi: 20.8,
    musclePercent: null,
    fatPercent: null,
    lifestyle: {
      concern: "sleep",
      sleep: "low",
      stress: "medium",
      screenTime: "high",
      diet: "irregular",
      exercise: "low",
    },
  },
  {
    id: 3,
    date: "2026-03-15",
    weight: 54.2,
    height: 162,
    bmi: 20.65,
    musclePercent: 32.4,
    fatPercent: 26.4,
    lifestyle: {
      concern: "immunity",
      sleep: "normal",
      stress: "medium",
      screenTime: "medium",
      diet: "normal",
      exercise: "sometimes",
    },
  },
];

function getInitialRecords() {
  try {
    const savedRecords = localStorage.getItem(STORAGE_KEY);
    return savedRecords ? JSON.parse(savedRecords) : seedRecords;
  } catch (error) {
    console.error("Cannot load records from localStorage", error);
    return seedRecords;
  }
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) return { label: "น้ำหนักน้อย", className: "bg-sky-50 text-sky-700" };
  if (bmi < 23) return { label: "สมส่วน", className: "bg-[#005ba8]/10 text-[#005ba8]" };
  if (bmi < 25) return { label: "น้ำหนักเกิน", className: "bg-amber-50 text-amber-700" };
  if (bmi < 30) return { label: "อ้วนระดับ 1", className: "bg-orange-50 text-orange-700" };
  return { label: "อ้วนระดับ 2", className: "bg-red-50 text-red-700" };
}

function formatPercent(value) {
  return value === null || value === undefined || value === "" ? "—" : `${Number(value).toFixed(1)}%`;
}

function getLatestBodyScan(records) {
  return [...records]
    .reverse()
    .find((item) => item.musclePercent !== null || item.fatPercent !== null);
}

function getVitaminRecommendations(lifestyle, latestBodyScan) {
  const recs = [];

  if (lifestyle.concern === "tired" || lifestyle.sleep === "low" || lifestyle.diet === "irregular") {
    recs.push({
      icon: Battery,
      title: "วิตามินบีรวม",
      reason: "เหมาะกับคนอ่อนเพลีย กินไม่เป็นเวลา หรือใช้พลังงานเยอะ",
      hook: "ตัวช่วยพื้นฐานสำหรับวันทำงานหนัก",
      tag: "Energy",
    });
  }

  if (lifestyle.stress === "high" || lifestyle.sleep === "low" || lifestyle.concern === "sleep") {
    recs.push({
      icon: Moon,
      title: "แมกนีเซียม / Sleep Care",
      reason: "เหมาะกับคนเครียดง่าย พักผ่อนน้อย หรืออยากดูแลคุณภาพการนอน",
      hook: "แนะนำคู่กับ routine ก่อนนอน",
      tag: "Sleep",
    });
  }

  if (lifestyle.concern === "immunity" || lifestyle.sleep === "low") {
    recs.push({
      icon: Shield,
      title: "วิตามินซี + ซิงก์",
      reason: "เหมาะกับคนอยากดูแลภูมิคุ้มกัน พักผ่อนน้อย หรือเจอคนเยอะ",
      hook: "daily protection pack",
      tag: "Immunity",
    });
  }

  if (lifestyle.screenTime === "high" || lifestyle.concern === "eye") {
    recs.push({
      icon: Eye,
      title: "ลูทีน / Eye Care",
      reason: "เหมาะกับคนใช้มือถือ คอม หรืออ่านหน้าจอนาน",
      hook: "Eye Care Set สำหรับคนทำงานหน้าจอ",
      tag: "Eye Care",
    });
  }

  if (lifestyle.diet === "lowProtein" || lifestyle.exercise === "regular" || latestBodyScan?.musclePercent < 32) {
    recs.push({
      icon: Dumbbell,
      title: "โปรตีน / นมโปรตีน",
      reason: "เหมาะกับคนกินโปรตีนน้อย อยากรักษากล้ามเนื้อ หรือออกกำลังกาย",
      hook: "จับคู่กับเป้าหมายเพิ่มกล้ามเนื้อ",
      tag: "Protein",
    });
  }

  if (recs.length === 0) {
    recs.push({
      icon: Sparkles,
      title: "มัลติวิตามินพื้นฐาน",
      reason: "เหมาะกับคนอยากเริ่มดูแลสุขภาพแบบง่ายและครบกว่าเดิม",
      hook: "starter pack สำหรับลูกค้าที่ไม่รู้จะเริ่มจากอะไร",
      tag: "Daily",
    });
  }

  return recs.slice(0, 4);
}

function getLifestyleInsight(lifestyle, latest, latestBodyScan) {
  const first = getVitaminRecommendations(lifestyle, latestBodyScan)[0]?.title || "วิตามินพื้นฐาน";

  if (lifestyle.sleep === "low" && lifestyle.stress === "high") {
    return `คุณมี pattern พักผ่อนน้อย + เครียดสูง เหมาะกับการเริ่มจาก ${first}`;
  }
  if (lifestyle.screenTime === "high") {
    return `คุณใช้หน้าจอค่อนข้างมาก เหมาะกับการเสนอสินค้า Eye Care คู่กับ ${first}`;
  }
  if (lifestyle.diet === "lowProtein" || latestBodyScan?.musclePercent < 32) {
    return "ข้อมูลบอกว่าควรเสริมโปรตีนให้พอ เหมาะกับการเสนอ Protein Set";
  }
  if (latest?.bmi >= 23) {
    return "BMI เริ่มเกินเกณฑ์ เหมาะกับสินค้าน้ำตาลน้อย โปรตีน และวิตามินดูแลสุขภาพประจำวัน";
  }
  return `สุขภาพโดยรวมอยู่ในเกณฑ์ดี เหมาะกับการเสนอ ${first} เป็น daily wellness routine`;
}

function InputField({ label, value, onChange, type = "number", placeholder, helper }) {
  return (
    <label className="block space-y-2">
      <span className="text-[13px] font-bold text-slate-600">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#005ba8] focus:ring-4 focus:ring-[#005ba8]/15 sm:h-12"
      />
      {helper && <p className="text-xs text-slate-400">{helper}</p>}
    </label>
  );
}

function MetricCard({ title, value, helper, icon: Icon }) {
  return (
    <div className="rounded-[24px] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400">{title}</p>
          <p className="mt-2 text-[24px] font-extrabold leading-none tracking-[-0.035em] text-slate-950 sm:text-[32px]">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-400">{helper}</p>
        </div>
        <div className="rounded-2xl bg-[#005ba8]/10 p-3 text-[#005ba8]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function VitaminCard({ item }) {
  const Icon = item.icon;
  return (
    <div className="rounded-[22px] bg-white p-3 shadow-[0_12px_35px_rgba(0,91,168,0.07)] sm:rounded-[24px] sm:p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#005ba8]/10 p-2.5 text-[#005ba8] sm:p-3">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-extrabold tracking-[-0.03em] text-slate-950 sm:text-base">{item.title}</p>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 sm:text-[11px]">
              {item.tag}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">{item.reason}</p>
          <div className="mt-3 rounded-2xl bg-[#005ba8]/5 p-3">
            <p className="text-xs font-bold text-[#005ba8]">Contextual Sell</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{item.hook}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="rounded-[22px] border border-dashed border-[#005ba8]/25 bg-white p-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#005ba8]/10 text-[#005ba8]">
        <Brain className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-extrabold text-slate-950">รอผลวิเคราะห์</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        เลือกคำตอบด้านขวา แล้วกด “ดูวิตามินที่เหมาะกับคุณ” เพื่อแสดง Insight และวิตามินแนะนำ
      </p>
    </div>
  );
}

export default function HealthTrackerLocalStorageV1() {
  const [records, setRecords] = useState(getInitialRecords);
  const [activeTrendTab, setActiveTrendTab] = useState("chart");
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const [bmiForm, setBmiForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    weight: "",
    height: "162",
    musclePercent: "",
    fatPercent: "",
  });

  const [quizForm, setQuizForm] = useState({
    concern: "sleep",
    sleep: "low",
    stress: "medium",
    screenTime: "high",
    diet: "irregular",
    exercise: "low",
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("Cannot save records to localStorage", error);
    }
  }, [records]);

  const sortedRecords = useMemo(() => [...records].sort((a, b) => a.date.localeCompare(b.date)), [records]);
  const latest = sortedRecords[sortedRecords.length - 1];
  const latestBodyScan = getLatestBodyScan(sortedRecords);
  const bmiStatus = latest ? getBmiCategory(latest.bmi) : null;
  const vitaminRecommendations = getVitaminRecommendations(quizForm, latestBodyScan);
  const lifestyleInsight = getLifestyleInsight(quizForm, latest, latestBodyScan);

  const chartData = sortedRecords.map((item) => ({
    date: item.date.slice(5),
    BMI: Number(item.bmi.toFixed(2)),
    muscle: item.musclePercent ?? null,
    fat: item.fatPercent ?? null,
  }));

  function handleBmiChange(field, value) {
    setBmiForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleLifestyleChange(key, value) {
    setQuizForm((prev) => ({ ...prev, [key]: value }));
    setShowQuizResult(false);
  }

  function handleSaveBmi() {
    const weight = Number(bmiForm.weight);
    const height = Number(bmiForm.height);
    const musclePercent = bmiForm.musclePercent === "" ? null : Number(bmiForm.musclePercent);
    const fatPercent = bmiForm.fatPercent === "" ? null : Number(bmiForm.fatPercent);

    if (!bmiForm.date || !weight || !height) {
      alert("กรุณากรอกวันที่ น้ำหนัก และส่วนสูง");
      return;
    }

    if (weight <= 0 || height <= 0) {
      alert("น้ำหนักและส่วนสูงต้องมากกว่า 0");
      return;
    }

    if ((musclePercent !== null && musclePercent < 0) || (fatPercent !== null && fatPercent < 0)) {
      alert("เปอร์เซ็นต์ต้องไม่ติดลบ");
      return;
    }

    const bmi = weight / Math.pow(height / 100, 2);

    setRecords((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: bmiForm.date,
        weight,
        height,
        musclePercent,
        fatPercent,
        bmi,
        lifestyle: quizForm,
      },
    ]);

    setBmiForm({
      date: new Date().toISOString().slice(0, 10),
      weight: "",
      height: String(height),
      musclePercent: "",
      fatPercent: "",
    });
  }

  function handleSaveQuiz() {
    if (!latest) {
      alert("กรุณาบันทึก BMI อย่างน้อย 1 ครั้งก่อน");
      return;
    }

    setRecords((prev) => [
      ...prev,
      {
        ...latest,
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        lifestyle: quizForm,
      },
    ]);

    setShowQuizResult(true);
    setShowResultModal(true);
  }

  function handleDelete(id) {
    const ok = window.confirm("ต้องการลบข้อมูลรายการนี้ใช่ไหม?");
    if (!ok) return;
    setRecords((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Noto Sans Thai', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      <div className="min-h-screen w-full bg-[#eef6ff] px-3 py-3 text-slate-900 sm:px-5 sm:py-5 lg:px-8">
        <div className="mx-auto w-full max-w-[1440px] space-y-4 sm:space-y-5">
          <section className="relative overflow-hidden rounded-[26px] bg-[#031124] p-4 text-white shadow-[0_24px_70px_rgba(0,91,168,0.18)] sm:rounded-[34px] sm:p-6 lg:rounded-[38px] lg:p-8">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#005ba8] opacity-70 blur-3xl" />
            <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-cyan-400 opacity-25 blur-3xl" />

            <div className="relative grid gap-4 xl:grid-cols-[1.05fr_0.95fr] xl:items-stretch">
              <div className="flex flex-col justify-between gap-6 sm:min-h-[260px] lg:min-h-[320px]">
                <div>
                  <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-blue-100 ring-1 ring-white/10 sm:text-xs">
                    <Brain className="h-4 w-4 shrink-0" />
                    <span className="truncate">Lifestyle Vitamin Matching</span>
                  </div>
                  <h1 className="mt-5 max-w-2xl text-[26px] font-extrabold leading-[1.12] tracking-[-0.035em] text-white sm:text-4xl lg:text-6xl">
                    eXta health care
                  </h1>
                  <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/65 sm:text-sm lg:text-base">
                    ใช้แบบทดสอบพฤติกรรม + BMI + Body Scan เพื่อสร้าง Insight และเสนอสินค้าแบบตรงบริบท
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl sm:rounded-[34px] sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-white/55 sm:text-sm">BMI Summary</p>
                    <h2 className="mt-1 text-base font-extrabold tracking-[-0.02em] text-white sm:text-2xl lg:text-3xl">
                      สุขภาพล่าสุดของคุณ
                    </h2>
                  </div>
                  <div className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold sm:text-xs ${bmiStatus?.className || "bg-white/10 text-white"}`}>
                    {bmiStatus?.label || "No data"}
                  </div>
                </div>

                {latest ? (
                  <>
                    <div className="mt-5 rounded-[22px] bg-white/10 p-4 ring-1 ring-white/10 sm:bg-transparent sm:p-0 sm:ring-0">
                      <p className="text-xs text-white/50 sm:text-sm">BMI Score</p>
                      <div className="mt-1 flex items-end justify-between gap-3">
                        <p className="text-5xl font-extrabold leading-none tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
                          {latest.bmi.toFixed(2)}
                        </p>
                        <div className="rounded-2xl bg-white px-4 py-3 text-slate-950 shadow-[0_16px_45px_rgba(0,0,0,0.14)] sm:hidden">
                          <p className="text-[11px] font-semibold text-slate-400">Weight</p>
                          <p className="text-xl font-extrabold tracking-[-0.04em]">{latest.weight}</p>
                          <p className="text-[11px] text-slate-400">kg</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 hidden w-fit rounded-[22px] bg-white p-4 text-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:block">
                      <p className="text-xs font-semibold text-slate-400">Weight</p>
                      <p className="mt-1 text-2xl font-extrabold tracking-[-0.05em]">{latest.weight}</p>
                      <p className="text-xs text-slate-400">kg</p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6">
                      <div className="rounded-[18px] bg-white/12 p-3 ring-1 ring-white/10 sm:rounded-[24px] sm:p-4">
                        <p className="text-[11px] text-white/55 sm:text-xs">Fat</p>
                        <p className="mt-1 text-xl font-extrabold text-white sm:text-2xl">{formatPercent(latestBodyScan?.fatPercent)}</p>
                        <p className="mt-1 text-[11px] text-white/45 sm:text-xs">Body Scan</p>
                      </div>
                      <div className="rounded-[18px] bg-white/12 p-3 ring-1 ring-white/10 sm:rounded-[24px] sm:p-4">
                        <p className="text-[11px] text-white/55 sm:text-xs">Muscle</p>
                        <p className="mt-1 text-xl font-extrabold text-white sm:text-2xl">{formatPercent(latestBodyScan?.musclePercent)}</p>
                        <p className="mt-1 text-[11px] text-white/45 sm:text-xs">Body Scan</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-5 rounded-[22px] bg-white p-4 text-slate-950">
                    <p className="font-bold">ยังไม่มีข้อมูล BMI</p>
                    <p className="mt-1 text-sm text-slate-500">เริ่มบันทึก BMI เพื่อดูผลสรุป</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard title="BMI" value={latest ? latest.bmi.toFixed(2) : "—"} helper={bmiStatus?.label || "ยังไม่มีข้อมูล"} icon={Activity} />
            <MetricCard title="Body Scan" value={formatPercent(latestBodyScan?.fatPercent)} helper={latestBodyScan ? `ไขมันล่าสุด ${latestBodyScan.date}` : "optional"} icon={Scale} />
            <MetricCard title="วิตามินที่ Match" value={showQuizResult ? `${vitaminRecommendations.length} รายการ` : "รอผล"} helper="จาก Lifestyle Quiz" icon={ShoppingBag} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[420px_1fr] xl:items-start">
            <div className="rounded-[26px] bg-white p-4 shadow-[0_18px_70px_rgba(15,23,42,0.07)] sm:rounded-[34px] sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#005ba8]">Module 2</p>
                  <h2 className="mt-1 text-lg font-extrabold tracking-[-0.025em] text-slate-950 sm:text-xl">BMI Tracker</h2>
                  <p className="mt-1 text-sm text-slate-400">บันทึกน้ำหนัก/BMI ส่วน Body Scan ใส่เฉพาะวันที่มีเครื่องวัด</p>
                </div>
                <div className="rounded-2xl bg-[#005ba8]/10 p-3 text-[#005ba8]"><Scale className="h-5 w-5" /></div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <InputField label="วันที่" type="date" value={bmiForm.date} onChange={(e) => handleBmiChange("date", e.target.value)} />
                <div className="rounded-[22px] bg-slate-50 p-4 sm:rounded-[26px]">
                  <p className="mb-3 text-sm font-extrabold text-slate-950">ข้อมูล BMI</p>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <InputField label="น้ำหนัก (กก.)" placeholder="เช่น 54.5" value={bmiForm.weight} onChange={(e) => handleBmiChange("weight", e.target.value)} />
                    <InputField label="ส่วนสูง (ซม.)" placeholder="เช่น 162" value={bmiForm.height} onChange={(e) => handleBmiChange("height", e.target.value)} />
                  </div>
                </div>

                <div className="rounded-[22px] border border-dashed border-[#005ba8]/25 bg-[#005ba8]/5 p-4 sm:rounded-[26px]">
                  <p className="text-sm font-extrabold text-slate-950">Body Scan Optional</p>
                  <p className="mb-3 mt-1 text-xs leading-5 text-slate-500">ใส่เฉพาะวันที่มีเครื่องวัด เพื่อช่วยแนะนำสินค้าแม่นขึ้น</p>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <InputField label="เปอร์เซ็นต์กล้ามเนื้อ" placeholder="เช่น 32.4" value={bmiForm.musclePercent} onChange={(e) => handleBmiChange("musclePercent", e.target.value)} helper="เว้นว่างได้" />
                    <InputField label="เปอร์เซ็นต์ไขมัน" placeholder="เช่น 26.4" value={bmiForm.fatPercent} onChange={(e) => handleBmiChange("fatPercent", e.target.value)} helper="เว้นว่างได้" />
                  </div>
                </div>

                <button onClick={handleSaveBmi} className="h-11 w-full rounded-2xl bg-slate-950 text-sm font-bold text-white transition hover:bg-slate-800 sm:h-12">บันทึก BMI</button>
              </div>
            </div>

            <div className="min-w-0 space-y-4">
              <div className="rounded-[26px] bg-white p-4 shadow-[0_18px_70px_rgba(15,23,42,0.07)] sm:rounded-[34px] sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-extrabold text-slate-950 sm:text-xl">Health Trend</h2>
                  <div className="flex w-full rounded-xl bg-slate-100 p-1 sm:w-auto">
                    <button onClick={() => setActiveTrendTab("chart")} className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold sm:flex-none ${activeTrendTab === "chart" ? "bg-[#005ba8] text-white" : "text-slate-500"}`}>กราฟ</button>
                    <button onClick={() => setActiveTrendTab("history")} className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold sm:flex-none ${activeTrendTab === "history" ? "bg-[#005ba8] text-white" : "text-slate-500"}`}>ประวัติ</button>
                  </div>
                </div>

                {activeTrendTab === "chart" && (
                  <div className="h-[240px] w-full sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="BMI" name="BMI" stroke={BRAND_BLUE} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="muscle" name="% กล้ามเนื้อ" stroke="#32a7e2" strokeWidth={3} connectNulls={false} />
                        <Line type="monotone" dataKey="fat" name="% ไขมัน" stroke="#64748B" strokeWidth={3} connectNulls={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {activeTrendTab === "history" && (
                  <>
                    <div className="space-y-3 sm:hidden">
                      {sortedRecords.map((item) => (
                        <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-slate-400">วันที่</p>
                              <p className="mt-1 text-sm font-bold text-slate-800">{item.date}</p>
                            </div>
                            <button onClick={() => handleDelete(item.id)} className="rounded-xl p-2 text-slate-300 hover:bg-red-50 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-400">BMI</p><p className="font-extrabold text-[#005ba8]">{item.bmi.toFixed(2)}</p></div>
                            <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-400">น้ำหนัก</p><p className="font-bold text-slate-700">{item.weight} กก.</p></div>
                            <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-400">กล้ามเนื้อ</p><p className="font-bold text-slate-700">{formatPercent(item.musclePercent)}</p></div>
                            <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-400">ไขมัน</p><p className="font-bold text-slate-700">{formatPercent(item.fatPercent)}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="hidden overflow-x-auto sm:block">
                      <table className="w-full min-w-[720px] text-sm">
                        <thead><tr className="border-b text-left text-slate-400"><th className="py-3">วันที่</th><th>BMI</th><th>น้ำหนัก</th><th>กล้ามเนื้อ</th><th>ไขมัน</th><th className="text-right">จัดการ</th></tr></thead>
                        <tbody>
                          {sortedRecords.map((item) => (
                            <tr key={item.id} className="border-b last:border-0">
                              <td className="py-3 font-medium text-slate-700">{item.date}</td>
                              <td className="font-bold text-[#005ba8]">{item.bmi.toFixed(2)}</td>
                              <td>{item.weight} กก.</td>
                              <td>{formatPercent(item.musclePercent)}</td>
                              <td>{formatPercent(item.fatPercent)}</td>
                              <td className="text-right"><button onClick={() => handleDelete(item.id)} className="rounded-xl p-2 text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="w-full">
            <div className="rounded-[26px] bg-white p-4 shadow-[0_18px_70px_rgba(15,23,42,0.07)] sm:rounded-[34px] sm:p-6">
              <div className="mb-5 sm:mb-6">
                <p className="text-xs font-bold uppercase tracking-wide text-[#005ba8]">Module 1</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-[-0.025em] text-slate-950 sm:text-2xl">Lifestyle Quiz</h2>
                <p className="mt-1 text-sm text-slate-400">ตอบคำถามไลฟ์สไตล์ เพื่อสร้าง Insight และแนะนำวิตามินแบบตรงบริบท</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-[320px_1fr] xl:grid-cols-[380px_1fr]">
                <aside className="order-2 rounded-[24px] bg-[#005ba8]/5 p-4 sm:rounded-[28px] sm:p-5 lg:order-1">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-[#005ba8] p-3 text-white"><ShoppingBag className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-base font-extrabold tracking-[-0.025em] text-slate-950 sm:text-lg">วิตามินแนะนำสำหรับคุณ</h3>
                      <p className="text-xs text-slate-500">จะแสดงหลังจากกดส่งแบบทดสอบ</p>
                    </div>
                  </div>

                  {showQuizResult ? (
                    <>
                      <div className="rounded-[22px] bg-white p-4 sm:rounded-[24px]">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#005ba8]">Insight</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{lifestyleInsight}</p>
                      </div>

                      <div className="mt-4 space-y-3">
                        {vitaminRecommendations.map((item) => <VitaminCard key={item.title} item={item} />)}
                      </div>

                      <a
                        href="https://www.allonline.7eleven.co.th/health/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#005ba8] text-sm font-bold text-white transition hover:bg-[#004a8a] sm:h-12"
                      >
                        ดูสินค้าที่เหมาะกับคุณ <ChevronRight className="h-4 w-4" />
                      </a>
                    </>
                  ) : (
                    <EmptyResult />
                  )}
                </aside>

                <div className="order-1 lg:order-2">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {lifestyleQuestions.map((question) => (
                      <div key={question.key} className="space-y-3">
                        <p className="text-sm font-extrabold text-slate-950">{question.title}</p>
                        <div className="space-y-2">
                          {question.options.map((option) => {
                            const active = quizForm[question.key] === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleLifestyleChange(question.key, option.value)}
                                className={`w-full rounded-2xl px-3 py-3 text-left text-[13px] font-bold transition sm:px-4 sm:text-sm ${active ? "bg-[#005ba8] text-white shadow-[0_12px_30px_rgba(0,91,168,0.18)]" : "bg-slate-50 text-slate-500 hover:bg-[#005ba8]/5"}`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={handleSaveQuiz} className="mt-6 h-11 w-full rounded-2xl bg-[#005ba8] text-sm font-bold text-white transition hover:bg-[#004a8a] sm:h-12">
                    ดูวิตามินที่เหมาะกับคุณ
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[26px] bg-white p-4 shadow-xl sm:rounded-[32px] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[#005ba8]">Your Result</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950 sm:text-2xl">ผลวิเคราะห์ Lifestyle ของคุณ</h2>
            <p className="mt-3 rounded-2xl bg-[#005ba8]/5 p-4 text-sm font-bold leading-6 text-slate-800 sm:text-base sm:leading-7">{lifestyleInsight}</p>
            <div className="mt-5 space-y-3">{vitaminRecommendations.map((item) => <VitaminCard key={item.title} item={item} />)}</div>
            <button onClick={() => setShowResultModal(false)} className="mt-6 h-11 w-full rounded-2xl bg-[#005ba8] text-sm font-bold text-white sm:h-12">ปิด</button>
          </div>
        </div>
      )}
    </>
  );
}