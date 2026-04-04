/**
 * Mode Select Component - Title Screen
 * ゲームモード選択画面
 */

import React, { useState } from "react";
import type { GameContextType } from "../logic/types";

interface ModeSelectProps {
  context: GameContextType;
}

export const ModeSelect: React.FC<ModeSelectProps> = ({ context }) => {
  const [selectedMode, setSelectedMode] = useState<"human_vs_human" | "human_vs_ai" | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const handleStartGame = () => {
    if (selectedMode) {
      context.setGameMode(selectedMode, selectedMode === "human_vs_ai" ? difficulty : undefined);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-2">
            🏙️ City Chase
          </h1>
          <p className="text-gray-600 text-lg">
            警察 vs 容疑者の推理ゲーム
          </p>
        </div>

        {/* ゲームモード選択 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            ゲームモードを選択
          </h2>

          <div className="space-y-4">
            {/* 2人対戦 */}
            <button
              onClick={() => setSelectedMode("human_vs_human")}
              className={`w-full p-6 rounded-lg border-2 transition-all ${
                selectedMode === "human_vs_human"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">👥</div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-bold text-slate-900">2人対戦</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    人間 vs 人間（同じブラウザ、ターン制）
                  </p>
                </div>
                <div className={`text-2xl ${selectedMode === "human_vs_human" ? "opacity-100" : "opacity-0"}`}>
                  ✓
                </div>
              </div>
            </button>

            {/* AI対戦 */}
            <button
              onClick={() => setSelectedMode("human_vs_ai")}
              className={`w-full p-6 rounded-lg border-2 transition-all ${
                selectedMode === "human_vs_ai"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-300 bg-gray-50 hover:border-purple-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">🤖</div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-bold text-slate-900">AI対戦</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    人間 vs AI容疑者（難易度選択可能）
                  </p>
                </div>
                <div className={`text-2xl ${selectedMode === "human_vs_ai" ? "opacity-100" : "opacity-0"}`}>
                  ✓
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* AI難易度選択 */}
        {selectedMode === "human_vs_ai" && (
          <div className="mb-8 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">AI難易度を選択</h3>
            <div className="grid grid-cols-3 gap-3">
              {["easy", "medium", "hard"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level as "easy" | "medium" | "hard")}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    difficulty === level
                      ? "bg-purple-600 text-white"
                      : "bg-white text-slate-900 border-2 border-purple-300 hover:bg-purple-100"
                  }`}
                >
                  {level === "easy" && "🟢 Easy"}
                  {level === "medium" && "🟡 Medium"}
                  {level === "hard" && "🔴 Hard"}
                </button>
              ))}
            </div>

            {/* 難易度説明 */}
            <div className="mt-4 text-sm text-gray-700">
              {difficulty === "easy" && (
                <p>
                  <strong>Easy:</strong> AIが時々失敗する。初心者向け。
                </p>
              )}
              {difficulty === "medium" && (
                <p>
                  <strong>Medium:</strong> バランスの取れたAI。推奨。
                </p>
              )}
              {difficulty === "hard" && (
                <p>
                  <strong>Hard:</strong> AIが最善手を常に選ぶ。上級者向け。
                </p>
              )}
            </div>
          </div>
        )}

        {/* ゲーム開始ボタン */}
        <button
          onClick={handleStartGame}
          disabled={!selectedMode}
          className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
            selectedMode
              ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          🎮 ゲーム開始
        </button>

        {/* フッター */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            警察はヘリで容疑者を発見。
            <br />
            容疑者は11ラウンド逃げ切れば勝利。
          </p>
        </div>
      </div>
    </div>
  );
};
