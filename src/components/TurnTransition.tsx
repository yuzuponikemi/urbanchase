/**
 * Turn Transition Component
 * プレイヤー交代時の待機画面
 */

import React from "react";
import type { GameState, GameContextType } from "../logic/types";

interface TurnTransitionProps {
  state: GameState;
  context: GameContextType;
}

export const TurnTransition: React.FC<TurnTransitionProps> = ({ state, context }) => {
  const isNextCriminal = state.currentPlayer === "criminal";
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl mx-auto my-12 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
      {/* Searchlight effect */}
      <div className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-20 ${
        isNextCriminal ? "bg-rose-500" : "bg-sky-500"
      }`}></div>
      
      <div className={`w-24 h-24 mx-auto mb-8 rounded-2xl flex items-center justify-center text-5xl shadow-inner relative z-10 ${
        isNextCriminal ? "bg-rose-500/20 text-rose-500 border border-rose-500/30" : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
      }`}>
        {isNextCriminal ? "🚗" : "🚁"}
      </div>
      
      <h2 className="text-3xl md:text-5xl font-black mb-6 text-white tracking-tight relative z-10">
        {isNextCriminal ? "CRIMINAL" : "POLICE"} USE ONLY
      </h2>
      
      <p className="text-slate-400 text-lg mb-10 leading-relaxed relative z-10">
        {isNextCriminal ? "逃走経路を確保してください。" : "包囲網を縮めてください。"}<br />
        デバイスを次のプレーヤーに渡し、準備ができたら開始してください。
      </p>
      
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 mb-10 text-slate-300 text-sm flex items-center justify-center gap-3 relative z-10">
        <span className="text-amber-500 text-xl">⚠️</span>
        <span>作戦秘匿のため、画面を相手に見られないよう注意してください。</span>
      </div>
      
      <button
        onClick={() => context.startTurn()}
        className={`w-full py-5 rounded-2xl font-black text-2xl transition-all active:scale-95 shadow-xl relative z-10 ${
          isNextCriminal 
            ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40" 
            : "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/40"
        }`}
      >
        MISSION START
      </button>
    </div>
  );
};
