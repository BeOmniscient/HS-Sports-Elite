export function ScoresWidget() {
  return (
    <div className="bg-brand-dark text-white overflow-x-auto">
      <div className="flex items-center gap-6 px-4 py-2 max-w-screen-xl mx-auto min-h-[44px]">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-red flex-shrink-0">
          Live Scores
        </span>
        {/* ScoreStream embed — replace src with your ScoreStream widget URL once configured */}
        <div className="flex items-center gap-6 text-xs text-white/60 flex-shrink-0">
          <span className="text-white/30 text-[10px] uppercase tracking-widest">
            Configure ScoreStream widget in <code className="text-white/50">/components/scores/ScoresWidget.tsx</code>
          </span>
        </div>
      </div>
    </div>
  );
}
