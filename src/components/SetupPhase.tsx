/**
 * Setup Phase Component
 * Phase 1: 警察がヘリ3つを配置
 * Phase 2: 容疑者が隠れる建物を選択
 */

import React from "react";
import type { GameState, GameContextType } from "../logic/types";
import { Board } from "./Board";

interface SetupPhaseProps {
  state: GameState;
  context: GameContextType;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({ state, context }) => {
  const policePlacedCount = state.police.helicopters.filter(
    (h) => h.location.x >= 0 && h.location.y >= 0
  ).length;

  const isCriminalBuildingSet =
    state.criminal.hideBuilding.x >= 0 && state.criminal.hideBuilding.y >= 0;

  const handleIntersectionClick = (x: number, y: number) => {
    if (state.phase === "setup_police_heli") {
      const nextHeliId = (policePlacedCount + 1) as 1 | 2 | 3;
      context.placeHelicopter(nextHeliId, x, y);
    }
  };

  const handleBuildingClick = (x: number, y: number) => {
    if (state.phase === "setup_criminal_building") {
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
              ステップ 2: 容疑者が隠れる建物を選択
            </h2>
            <p className="text-gray-600 mb-4">
              建物をタップして隠れる場所を選んでください
            </p>
            {isCriminalBuildingSet && (
              <div className="text-sm text-green-600 mb-4">
                ✓ 建物が選択されました
              </div>
            )}
          </div>
        )}

        <Board
          state={state}
          onBuildingClick={handleBuildingClick}
          onIntersectionClick={handleIntersectionClick}
        />

        {state.phase === "setup_criminal_building" && (
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={handleStartGame}
              disabled={!isCriminalBuildingSet}
              className="px-6 py-3 md:px-8 md:py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors text-lg"
            >
              ゲーム開始
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
