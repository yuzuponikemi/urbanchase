/**
 * Setup Phase Component
 * Phase 1: 警察がヘリ3つを配置
 * Phase 2: 容疑者が隠れる建物を選択（AI対戦時は自動選択）
 */

import React, { useEffect } from "react";
import type { GameState, GameContextType } from "../logic/types";
import { Board } from "./Board";

interface SetupPhaseProps {
  state: GameState;
  context: GameContextType;
}

/**
 * AI容疑者の隠れ場所を選択（警察ヘリから最も遠い場所を優先）
 */
function findBestHidingPlace(state: GameState): { x: number; y: number } | null {
  let bestLocation: { x: number; y: number } | null = null;
  let maxMinDistance = -1;

  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      // 各建物について、最も近いヘリとの距離を計算
      let minDistanceToHeli = Infinity;

      for (const heli of state.police.helicopters) {
        // ヘリの交差点座標を建物座標に変換（概算）
        const heliToBuilding = {
          x: Math.abs(x - heli.location.x),
          y: Math.abs(y - heli.location.y),
        };
        const distance = heliToBuilding.x + heliToBuilding.y; // マンハッタン距離
        minDistanceToHeli = Math.min(minDistanceToHeli, distance);
      }

      // 最も近いヘリとの距離が大きい場所を選ぶ（複数ある場合はランダム）
      if (minDistanceToHeli > maxMinDistance) {
        maxMinDistance = minDistanceToHeli;
        bestLocation = { x, y };
      }
    }
  }

  return bestLocation;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({ state, context }) => {
  const policePlacedCount = state.police.helicopters.filter(
    (h) => h.location.x >= 0 && h.location.y >= 0
  ).length;

  const isCriminalBuildingSet =
    state.criminal.hideBuilding.x >= 0 && state.criminal.hideBuilding.y >= 0;

  // AI対戦時に自動的に隠れ場所を選ぶ
  useEffect(() => {
    if (
      state.gameMode === "human_vs_ai" &&
      state.phase === "setup_criminal_building" &&
      !isCriminalBuildingSet &&
      policePlacedCount === 3
    ) {
      // AIが隠れ場所を選ぶ（警察ヘリから最も遠い場所を優先）
      const bestLocation = findBestHidingPlace(state);
      if (bestLocation) {
        context.setCriminalHideBuilding(bestLocation.x, bestLocation.y);
      }
    }
  }, [state, context, policePlacedCount, isCriminalBuildingSet]);

  // AI対戦時にセットアップが完了したら自動的にゲーム開始
  useEffect(() => {
    if (
      state.gameMode === "human_vs_ai" &&
      state.phase === "setup_criminal_building" &&
      isCriminalBuildingSet
    ) {
      // 500msの遅延後にゲーム開始（UIのビジュアルフィードバック用）
      const timer = setTimeout(() => {
        context.startGame();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.gameMode, isCriminalBuildingSet, context]);

  const handleIntersectionClick = (x: number, y: number) => {
    if (state.phase === "setup_police_heli") {
      const nextHeliId = (policePlacedCount + 1) as 1 | 2 | 3;
      context.placeHelicopter(nextHeliId, x, y);
    }
  };

  const handleBuildingClick = (x: number, y: number) => {
    // AI対戦モードでは人間による選択を無視（AIが自動選択）
    if (state.phase === "setup_criminal_building" && state.gameMode !== "human_vs_ai") {
      context.setCriminalHideBuilding(x, y);
    }
  };

  const handleStartGame = () => {
    if (isCriminalBuildingSet) {
      context.startGame();
    }
  };

  const getNextHeliName = () => {
    const nextId = policePlacedCount + 1;
    const colors = ["赤", "青", "緑"];
    return `ヘリ ${nextId} (${colors[nextId - 1]})`;
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl w-full">
        {state.phase === "setup_police_heli" && (
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">シティチェイス</h1>
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-4">
              ステップ 1: 警察がヘリを配置
            </h2>
            <p className="text-gray-600 mb-4">
              交差点をタップして {getNextHeliName()} を配置してください
            </p>
            <div className="text-sm text-gray-500 mb-6">
              {policePlacedCount} / 3 ヘリ配置済み
            </div>
          </div>
        )}

        {state.phase === "setup_criminal_building" && (
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">シティチェイス</h1>
            <h2 className="text-xl md:text-2xl font-semibold text-red-600 mb-4">
              ステップ 2: {state.gameMode === "human_vs_ai" ? "AI容疑者が隠れる場所を決定中..." : "容疑者が隠れる建物を選択"}
            </h2>
            <p className="text-gray-600 mb-4">
              {state.gameMode === "human_vs_ai"
                ? "AIが最適な隠れ場所を分析しています..."
                : "建物をタップして隠れる場所を選んでください"}
            </p>
            {isCriminalBuildingSet && (
              <div className="text-sm text-green-600 mb-4">
                ✓ {state.gameMode === "human_vs_ai" ? "AI" : "容疑者"}が隠れる建物を決定しました
              </div>
            )}
          </div>
        )}

        <Board
          state={state}
          onBuildingClick={handleBuildingClick}
          onIntersectionClick={handleIntersectionClick}
        />

        {state.phase === "setup_criminal_building" && isCriminalBuildingSet && (
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={handleStartGame}
              className="px-6 py-3 md:px-8 md:py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              ゲーム開始
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
