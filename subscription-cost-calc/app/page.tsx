"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Cycle = "monthly" | "annual";
type Currency = "USD" | "INR";

interface Subscription {
  id: string;
  name: string;
  priceUSD: number;
  cycle: Cycle;
  colorIndex: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const USD_TO_INR = 84;

const POPULAR_SUBSCRIPTIONS = [
  "Netflix",
  "Spotify",
  "YouTube Premium",
  "Amazon Prime",
  "Disney+",
  "Apple Music",
  "iCloud",
  "Adobe Creative Cloud",
  "ChatGPT Plus",
  "Microsoft 365",
  "Google One",
  "Dropbox",
];

const ACCENT_COLORS = [
  "#7C3AED",
  "#2563EB",
  "#059669",
  "#D97706",
  "#DC2626",
  "#DB2777",
];

const STORAGE_KEY = "subsink_data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function annualCostUSD(s: Subscription): number {
  return s.cycle === "monthly" ? s.priceUSD * 12 : s.priceUSD;
}

function fmtAmount(usd: number, currency: Currency): string {
  if (currency === "INR")
    return `₹${Math.round(usd * USD_TO_INR).toLocaleString()}`;
  return `$${usd.toFixed(2)}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SubSink() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [subscriptionName, setSubscriptionName] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [colorCounter, setColorCounter] = useState(0);
  const [mounted, setMounted] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.subs)) {
          setSubs(
            data.subs.map((s: Record<string, unknown>) => ({
              ...s,
              priceUSD: s.priceUSD ?? s.price ?? 0,
            })),
          );
        }
        if (typeof data.colorCounter === "number")
          setColorCounter(data.colorCounter);
        if (data.currency === "USD" || data.currency === "INR")
          setCurrency(data.currency);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ subs, colorCounter, currency }),
    );
  }, [subs, colorCounter, currency, mounted]);

  const totalAnnualUSD = subs.reduce((sum, s) => sum + annualCostUSD(s), 0);
  const costPerDayUSD = totalAnnualUSD / 365;
  const costPerMonthUSD = totalAnnualUSD / 12;
  const sorted = [...subs].sort((a, b) => annualCostUSD(b) - annualCostUSD(a));
  const currencySymbol = currency === "INR" ? "₹" : "$";

  const canAdd =
    subscriptionName.trim() !== "" &&
    priceInput !== "" &&
    parseFloat(priceInput) > 0;

  function handleCurrencyChange(newCurrency: Currency) {
    if (newCurrency === currency) return;
    if (priceInput) {
      const n = parseFloat(priceInput);
      if (!isNaN(n)) {
        if (currency === "USD" && newCurrency === "INR") {
          setPriceInput(Math.round(n * USD_TO_INR).toString());
        } else if (currency === "INR" && newCurrency === "USD") {
          setPriceInput((n / USD_TO_INR).toFixed(2));
        }
      }
    }
    setCurrency(newCurrency);
  }

  function getPriceUSD(): number | null {
    if (!priceInput.trim()) return null;
    const n = parseFloat(priceInput);
    if (isNaN(n) || n <= 0) return null;
    return currency === "INR" ? n / USD_TO_INR : n;
  }

  function handleAdd() {
    const priceUSD = getPriceUSD();
    if (priceUSD === null) return;
    const name = subscriptionName.trim();
    if (!name) return;

    setSubs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        priceUSD,
        cycle,
        colorIndex: colorCounter % 6,
      },
    ]);
    setColorCounter((c) => c + 1);
    setSubscriptionName("");
    setPriceInput("");
  }

  function handleRemove(id: string) {
    setSubs((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSelectPreset(name: string) {
    setSubscriptionName(name);
    setPriceInput("");
    setTimeout(() => amountInputRef.current?.focus(), 0);
  }

  const inputStyle = {
    backgroundColor: "#0A0A0F",
    border: "1px solid #1E1E2E",
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#0A0A0F",
        color: "#ffffff",
        fontFamily: "var(--font-inter, Inter, system-ui, sans-serif)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-10 md:px-8 md:py-14">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1
            className="text-2xl font-bold text-white"
            style={{ letterSpacing: "-0.04em" }}
          >
            Subscriptions
          </h1>
          <p className="text-sm text-zinc-500">
            Track your subscriptions and see how much you're spending on them.
          </p>
        </div>
        <div
          className="rounded-2xl overflow-hidden mb-6 subsink-card"
          style={{
            background: "linear-gradient(135deg, rgba(30,27,75,0.6) 0%, rgba(19,19,26,0.95) 50%, rgba(19,19,26,1) 100%)",
            border: "1px solid rgba(124,58,237,0.15)",
            boxShadow: "0 4px 24px -4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset",
          }}
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Hero stat — Annual */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500/90 mb-2">
                  Total Monthly spend
                </p>
                <p
                  className="text-4xl md:text-5xl font-bold text-white tabular-nums tracking-tight"
                  style={{
                    letterSpacing: "-0.03em",
                    textShadow: "0 0 40px rgba(124,58,237,0.15)",
                  }}
                >
                  {fmtAmount(costPerMonthUSD, currency)}
                </p>
              </div>

              {/* Secondary stats */}
              <div className="flex gap-4 md:gap-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex-1 rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1">Annual</p>
                  <p className="text-lg font-semibold text-white tabular-nums">
                    {fmtAmount(totalAnnualUSD, currency)}
                  </p>
                </div>
                <div className="flex-1 rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1">Daily</p>
                  <p className="text-lg font-semibold text-white tabular-nums">
                    {fmtAmount(costPerDayUSD, currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Subscription */}
        <div
          className="rounded-2xl border p-5 mb-6"
          style={{ backgroundColor: "#13131A", borderColor: "#1E1E2E" }}
        >
          {/* Popular presets — full width grid */}
          <div className="mb-5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Quick add
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {POPULAR_SUBSCRIPTIONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectPreset(name)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200 text-center truncate
                    ${subscriptionName === name
                      ? "bg-purple-500/25 text-purple-300 border border-purple-500/50 hover:bg-purple-500/35 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-white/5 text-zinc-400 border border-zinc-800 hover:bg-white/10 hover:border-zinc-600 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Input row */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Subscription
              </label>
              <input
                type="text"
                value={subscriptionName}
                onChange={(e) => setSubscriptionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Or type your own..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                style={inputStyle}
              />
            </div>
            <div className="min-w-[120px]">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                {currencySymbol} Amount
              </label>
              <input
                ref={amountInputRef}
                type="number"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder={currency === "INR" ? "839" : "15.99"}
                min="0"
                step={currency === "INR" ? "1" : "0.01"}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                style={inputStyle}
              />
            </div>
            <div className="min-w-[140px]">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Billing
              </label>
              <div className="flex rounded-xl p-1 gap-1" style={inputStyle}>
                {(["monthly", "annual"] as Cycle[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCycle(c)}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
                    style={{
                      backgroundColor: cycle === c ? "#7C3AED" : "transparent",
                      color: cycle === c ? "#ffffff" : "#71717a",
                    }}
                  >
                    {c === "monthly" ? "Monthly" : "Annual"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex rounded-lg p-0.5 shrink-0" style={inputStyle}>
              {(["USD", "INR"] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => handleCurrencyChange(c)}
                  className="px-3 py-1 text-[10px] font-bold rounded-md transition-all"
                  style={{
                    backgroundColor: currency === c ? "#7C3AED" : "transparent",
                    color: currency === c ? "#fff" : "#71717a",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#7C3AED",
              border: "1px solid rgba(167, 139, 250, 0.6)",
            }}
          >
            Add Subscription
          </button>
        </div>

        {/* Subscription list */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "#13131A", borderColor: "#1E1E2E" }}
        >
          {subs.length === 0 ? (
            <div className="py-20 px-8 text-center">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: "rgba(124,58,237,0.15)" }}
              >
                <span
                  className="text-lg font-bold"
                  style={{ color: "#7C3AED" }}
                >
                  +
                </span>
              </div>
              <p className="text-zinc-400 text-sm font-medium">
                Add your first subscription
              </p>
              <p className="text-zinc-600 text-xs mt-1">
                Click a preset above or type your own
              </p>
            </div>
          ) : (
            <>
              <div
                className="px-5 py-4"
                style={{ borderBottom: "1px solid #1E1E2E" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Your subscriptions · {subs.length}{" "}
                  {subs.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="p-3 space-y-2">
                {sorted.map((sub) => {
                  const annualUSD = annualCostUSD(sub);
                  const color =
                    ACCENT_COLORS[sub.colorIndex % ACCENT_COLORS.length];
                  return (
                    <div
                      key={sub.id}
                      className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all hover:bg-white/[0.04]"
                    >
                      <div
                        className="w-1 h-10 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {sub.name}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {fmtAmount(sub.priceUSD, currency)} /{" "}
                          {sub.cycle === "monthly" ? "mo" : "yr"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-white tabular-nums">
                          {fmtAmount(annualUSD, currency)}
                        </p>
                        <p className="text-[10px] text-zinc-500">per year</p>
                      </div>
                      <button
                        onClick={() => handleRemove(sub.id)}
                        aria-label={`Remove ${sub.name}`}
                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
