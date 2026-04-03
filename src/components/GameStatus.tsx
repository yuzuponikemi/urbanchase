/**
 * Game Status Component
 * ラウンド、プレイヤー、痕跡情報などを表示
 */

import React from "react";
import type { GameState, GameContextType } from "../logic/types";

interface GameStatusProps {
  state: GameState;
  context: GameContextType;
}

export const GameStatus: React.FC<GameStatusProps> = ({ state }) => {
  const specialTraces = state.traceMarkers.filter((m) => m.color === "special");
  const allTraces = state.traceMarkers.length;

  const getPlayerName = () => {
    return state.currentPlayer === "criminal" ? "容疑者" : "警察";
  };

  const getPhaseDescription = () => {
    if (state.phase === "gameover") {
      return state.winner === "criminal_win"
        ? "容疑者の勝利！11ラウンド逃げ切りました！"
        : "警察の勝利！容疑者を発見しました！";
    }
    return `ラウンド ${state.round} / 11`;
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-4 md:p-6 mb-6 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        {/* ラウンド表示 */}
        <div className="text-center p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">ROUND</div>
          <div className="text-3xl font-black text-white flex items-center justify-center gap-1">
            <span className="text-blue-400">{state.round}</span>
            <span className="text-slate-600 text-sm font-normal">/ 11</span>
          </div>
        </div>

        {/* 現在のプレイヤー */}
        <div className="text-center p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">STANCE</div>
          <div
            className={`text-3xl font-bold flex items-center justify-center gap-2 ${
              state.currentPlayer === "criminal" ? "text-rose-500" : "text-sky-400"
            }`}
          >
            {state.currentPlayer === "criminal" ? "🚗" : "🚁"}
            <span className="text-sm font-bold uppercase tracking-tighter">{getPlayerName()}</span>
          </div>
        </div>

        {/* 痕跡数 */}
        <div className="text-center p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">TRACES</div>
          <div className="text-3xl font-black text-slate-200">
            {allTraces}
          </div>
        </div>

        {/* 特殊痕跡 */}
        <div className="text-center p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">COLLECTED</div>
          <div className="text-3xl font-black text-amber-400">
            {specialTraces.length}
            <span className="text-slate-600 text-sm font-normal">/ 2</span>
          </div>
        </div>
      </div>

      {/* ゲーム状態情報 */}
      {state.phase === "playing" && (
        <div className="mt-6 text-center border-t border-slate-700/50 pt-4">
          {state.police.lastSearchResult && (
            <div className="mt-2 text-sm inline-block px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700">
              <span className="text-slate-400 mr-2 uppercase text-xs font-bold">RADAR LOG:</span>
              <span
                className={`font-bold ${
                  state.police.lastSearchResult === "found"
                    ? "text-rose-500"
                    : state.police.lastSearchResult === "trace"
                    ? "text-amber-400"
                    : "text-slate-400"
                }`}
              >
                {state.police.lastSearchResult === "found" && "🎯 アジトを特定！"}
                {state.police.lastSearchResult === "trace" && "⚠️ 痕跡を確認（対象不在）"}
                {state.police.lastSearchResult === "nothing" && "💨 異常なし"}
                {state.police.lastSearchResult === "no_building" && "❌ 索敵不能"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ゲームオーバー */}
      {state.phase === "gameover" && (
        <div className="mt-6 text-center border-t border-slate-700/50 pt-4">
          <div
            className={`text-3xl font-black mb-4 ${
              state.winner === "criminal_win" ? "text-emerald-400" : "text-rose-500"
            }`}
          >
            {state.winner === "criminal_win"
              ? "🏁 OPERATION FAILED (CRIMINAL ESCAPED)"
              : "🔒 TARGET APPREHENDED (POLICE WIN)"}
          </div>
          <div className="text-slate-400 font-medium">{getPhaseDescription()}</div>
        </div>
      )}
    </div>
  );
};
