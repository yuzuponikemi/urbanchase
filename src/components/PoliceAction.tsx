/**
 * Police Action Component
 * 警察のヘリ操作（移動・検索）
 */

import React, { useState } from "react";
import type { GameState, GameContextType } from "../logic/types";
import { Board } from "./Board";
import { getAdjacentIntersections, getAdjacentBuildings } from "../logic/boardGeometry";

interface PoliceActionProps {
  state: GameState;
  context: GameContextType;
}

export const PoliceAction: React.FC<PoliceActionProps> = ({ state, context }) => {
  const [currentHeliIndex, setCurrentHeliIndex] = useState(0);
  const [actionMode, setActionMode] = useState<"move" | "search" | null>(null);

  const currentHeli = state.police.helicopters[currentHeliIndex];
  const heliColors: Record<string, string> = {
    red: "赤",
    blue: "青",
    green: "緑",
  };

  const handleBuildingClick = (x: number, y: number) => {
    if (actionMode === "search") {
      context.searchAdjacentBuilding(currentHeli.id, x, y);
    }
  };

  const handleIntersectionClick = (x: number, y: number) => {
    if (actionMode === "move") {
      context.moveHelicopter(currentHeli.id, x, y);
      completeHeliAction();
    }
  };

  const completeHeliAction = () => {
    if (currentHeliIndex < 2) {
      setCurrentHeliIndex(currentHeliIndex + 1);
      setActionMode(null);
      context.clearSearchResult();
    } else {
      // すべてのヘリが行動完了
      context.nextTurn();
      setCurrentHeliIndex(0);
      setActionMode(null);
    }
  };

  const adjacentIntersections = getAdjacentIntersections(currentHeli.location.x, currentHeli.location.y);
  const adjacentBuildings = getAdjacentBuildings(currentHeli.location.x, currentHeli.location.y);

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
          ラウンド {state.round} - 警察のターン
        </h2>
        <p className="text-gray-600 text-lg">
          ヘリ {currentHeliIndex + 1} ({heliColors[currentHeli.color]})を操作してください
        </p>
        <div className="mt-2 text-sm text-gray-500">
          現在地: 交差点 ({currentHeli.location.x}, {currentHeli.location.y})
        </div>
      </div>

      {/* アクション選択 */}
      {!actionMode && (
        <div className="bg-blue-50 rounded-lg p-4 md:p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-gray-700 font-semibold mb-4">
              {heliColors[currentHeli.color]}のヘリでどのアクションを実行しますか？
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setActionMode("move");
                  context.clearSearchResult();
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                🚁 移動
              </button>
              <button
                onClick={() => {
                  setActionMode("search");
                  context.clearSearchResult();
                }}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors"
              >
                🔍 検索
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 移動モード */}
      {actionMode === "move" && (
        <div className="bg-blue-100 rounded-lg p-4 mb-6 text-center">
          <p className="text-blue-900 font-semibold">
            隣接する交差点に移動してください（上下左右のいずれか）
          </p>
          <div className="text-xs text-blue-700 mt-2">
            隣接交差点: {adjacentIntersections.map((i) => `(${i.x},${i.y})`).join(", ")}
          </div>
        </div>
      )}

      {/* 検索モード */}
      {actionMode === "search" && (
        <div className="bg-yellow-100 rounded-lg p-4 mb-6 text-center">
          <p className="text-yellow-900 font-semibold">
            隣接する建物を検索してください
          </p>
          <div className="text-xs text-yellow-700 mt-2">
            隣接建物: {adjacentBuildings.map((b) => `(${b.x},${b.y})`).join(", ")}
          </div>
          {state.police.lastSearchResult && (
            <div className="mt-4">
              <div className="text-sm font-bold text-gray-800">検索結果:</div>
              <div
                className={`text-base font-bold mt-1 ${
                  state.police.lastSearchResult === "found"
                    ? "text-red-600"
                    : state.police.lastSearchResult === "trace"
                    ? "text-yellow-700"
                    : state.police.lastSearchResult === "nothing"
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                {state.police.lastSearchResult === "found" && "🎯 容疑者を発見！"}
                {state.police.lastSearchResult === "trace" && "⚠️ 痕跡はありますが容疑者はいません"}
                {state.police.lastSearchResult === "nothing" && "✅ 痕跡も見当たりません"}
                {state.police.lastSearchResult === "no_building" && "❌ 隣接していない建物です"}
              </div>
              <button
                onClick={() => completeHeliAction()}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                次のヘリ
              </button>
            </div>
          )}
        </div>
      )}

      {/* ボード */}
      <Board
        state={state}
        onBuildingClick={handleBuildingClick}
        onIntersectionClick={handleIntersectionClick}
      />

      {/* プログレス表示 */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600 font-semibold">
          ヘリの操作進捗: {currentHeliIndex + 1} / 3
        </div>
        <div className="flex gap-2 justify-center mt-2">
          {state.police.helicopters.map((heli) => (
            <div
              key={heli.id}
              className={`w-3 h-3 rounded-full transition-all ${
                heli.id <= currentHeliIndex + 1
                  ? "bg-blue-600 w-4 h-4"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
