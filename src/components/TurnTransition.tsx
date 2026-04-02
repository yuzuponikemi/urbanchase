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
    <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 text-center max-w-2xl mx-auto my-12 animate-in fade-in zoom-in duration-300">
      <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl ${
        isNextCriminal ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
      }`}>
        {isNextCriminal ? "👤" : "🚁"}
      </div>
      
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        {isNextCriminal ? "容疑者" : "警察"}プレーヤーの番です
      </h2>
      
      <p className="text-gray-600 text-lg mb-8 leading-relaxed">
        デバイスを次のプレーヤーに渡してください。<br />
        準備ができたら下のボタンを押してターンを開始します。
      </p>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-amber-800 text-sm">
        ⚠️ 相手に画面が見えないように注意してください
      </div>
      
      <button
        onClick={() => context.startTurn()}
        className={`w-full py-4 rounded-xl font-bold text-xl transition-all active:scale-95 shadow-lg ${
          isNextCriminal 
            ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200" 
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
        }`}
      >
        ターンを開始する
      </button>
    </div>
  );
};
