"use client";

export function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-400"
      : score >= 50
        ? "text-yellow-400"
        : "text-red-400";

  const bgColor =
    score >= 80
      ? "border-green-400/30"
      : score >= 50
        ? "border-yellow-400/30"
        : "border-red-400/30";

  const label = score >= 80 ? "Good" : score >= 50 ? "Needs work" : "Poor";

  return (
    <div
      className={`inline-flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 ${bgColor}`}
    >
      <span className={`text-4xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-gray-400 mt-1">{label}</span>
    </div>
  );
}
