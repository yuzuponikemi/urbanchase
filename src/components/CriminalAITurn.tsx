/**
 * Criminal AI Turn Component
 * AIターンの自動実行と表示
 */

import React, { useEffect } from "react";
import type { GameState, GameContextType } from "../logic/types";
import { Board } from "./Board";
import { CriminalAI } from "../logic/aiPlayer";

interface CriminalAITurnProps {
  state: GameState;
  context: GameContextType;
}

export const CriminalAITurn: React.FC<CriminalAITurnProps> = ({ state, context }) => {
  const [isThinking, setIsThinking] = React.useState(true);
  const [dots, setDots] = React.useState(".");

  // アニメーション用ドットの更新
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  // AI実行
  useEffect(() => {
    const timer = setTimeout(() => {
      const ai = new CriminalAI(state.aiDifficulty);
      const targetPos = ai.decideMoveTarget(state);

      // AI移動を実行
      context.moveCriminal(targetPos.x, targetPos.y);

      // ターン遷移
      setTimeout(() => {
        context.nextTurn();
        setIsThinking(false);
      }, 800); // 移動アニメーション時間
    }, 2000); // 考慮時間

    return () => clearTimeout(timer);
  }, [state, context]);

  return (
    <div className="w-full space-y-6">
      {/* AI考慮中の表示 */}
      {isThinking && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8 text-center border-2 border-purple-200">
          <div className="mb-4">
            <h2 className="text-3xl">🤖</h2>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-purple-900 mb-2">
            AI（容疑者）のターン
          </h2>
          <p className="text-purple-800 font-semibold mb-4">
            移動先を決定しています{dots}
          </p>

          {/* 難易度表示 */}
          <div className="inline-block px-4 py-2 bg-white rounded-lg text-sm font-medium text-purple-700 border border-purple-300">
            難易度: {state.aiDifficulty === "easy" && "🟢 Easy"}
            {state.aiDifficulty === "medium" && "🟡 Medium"}
            {state.aiDifficulty === "hard" && "🔴 Hard"}
          </div>

          {/* スピナー */}
          <div className="mt-6 flex justify-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* ボード表示 */}
      <Board
        state={state}
        onBuildingClick={() => {}} // AI中は無操作
        onIntersectionClick={() => {}} // AI中は無操作
      />

      {/* メッセージ */}
      <div className="text-center text-gray-600 text-sm">
        <p>ラウンド {state.round} - AI容疑者がターンを実行中...</p>
      </div>
    </div>
  );
};
