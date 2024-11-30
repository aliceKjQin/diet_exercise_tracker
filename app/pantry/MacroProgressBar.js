export default function MacroProgressBar({ current, goal, label, unit }) {
  const percentage = Math.min((current / goal) * 100, 100); // Cap percentage at 100%

  return (
    <div className="flex flex-col gap-2">
      <p className="">
        <span className="font-semibold textGradient dark:text-blue-500">{label}: </span>
        <span>{`${current} / ${goal} ${unit}`} | </span>
        <span>{((current/goal)*100).toFixed(0)} % to goal</span>
      </p>
      <div className="w-full bg-stone-300 rounded-full h-6 sm:h-8">
        <div
            className="bg-emerald-400 h-6 sm:h-8 rounded-full"
            style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
