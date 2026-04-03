/**
 * Police Action Component
 * 警察のヘリ操作（移動・検索）
 */

import React, { useState } from "react";
import type { GameState, GameContextType } from "../logic/types";
import { Board } from "./Board";
import { getAdjacentBuildings, getAdjacentIntersectionsFromIntersection } from "../logic/boardGeometry";

interface PoliceActionProps {
  state: GameState;
  context: GameContextType;
}

export const PoliceAction: React.FC<PoliceActionProps> = ({ state, context }) => {
  const [selectedHeliId, setSelectedHeliId] = useState<1 | 2 | 3 | null>(null);
  const [actionMode, setActionMode] = useState<"move" | "search" | null>(null);

  const selectedHeli = state.police.helicopters.find((h) => h.id === selectedHeliId);
  const heliColors: Record<string, string> = {
    red: "赤",
    blue: "青",
    green: "緑",
  };

  // 検索モード時: 選択中ヘリの隣接建物をハイライト
  const searchableBuildings =
    actionMode === "search" && selectedHeli && selectedHeli.location.x >= 0
      ? getAdjacentBuildings(selectedHeli.location.x, selectedHeli.location.y)
      : [];

  // 移動モード時: 選択中ヘリの隣接交差点をハイライト
  const moveableIntersections =
    actionMode === "move" && selectedHeli && selectedHeli.location.x >= 0
      ? getAdjacentIntersectionsFromIntersection(selectedHeli.location.x, selectedHeli.location.y)
      : [];

  const handleBuildingClick = (x: number, y: number) => {
    if (actionMode === "search" && selectedHeliId) {
      context.searchAdjacentBuilding(selectedHeliId, x, y);
    }
  };

  const handleIntersectionClick = (x: number, y: number) => {
    // 既にそこにいるヘリを選択
    const clickedHeli = state.police.helicopters.find(
      (h) => h.location.x === x && h.location.y === y
    );

    if (clickedHeli) {
      if (state.police.actedHeliIds.includes(clickedHeli.id)) {
        // 行動済み
        return;
      }
      setSelectedHeliId(clickedHeli.id);
      setActionMode(null);
      context.clearSearchResult();
      return;
    }

    if (actionMode === "move" && selectedHeliId) {
      // 隣接しているかチェックしてから呼ぶ（あるいは context が失敗を返す）
      const moved = context.moveHelicopter(selectedHeliId, x, y);
      if (moved) {
        completeHeliAction();
      } else {
        // 移動失敗（隣接していない場合など）
        console.log("Invalid move target");
      }
    }
  };

  const completeHeliAction = () => {
    if (selectedHeliId) {
      context.completeHeliAction(selectedHeliId);
      setSelectedHeliId(null);
      setActionMode(null);
      context.clearSearchResult();
    }
  };

  const allActed = state.police.actedHeliIds.length === 3;

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
          ラウンド {state.round} - 警察のターン
        </h2>
        {!allActed ? (
          <p className="text-gray-600 text-lg">
            操作するヘリを選択してください
          </p>
        ) : (
          <p className="text-green-600 font-bold text-lg">
            すべてのヘリが行動を完了しました
          </p>
        )}
      </div>

      {/* ヘリ選択 UI */}
      <div className="flex justify-center gap-4 mb-6">
        {state.police.helicopters.map((heli) => {
          const isActed = state.police.actedHeliIds.includes(heli.id);
          const isSelected = selectedHeliId === heli.id;
          const bgColors: Record<string, string> = {
            red: isActed ? "bg-red-200" : isSelected ? "bg-red-600" : "bg-red-500",
            blue: isActed ? "bg-blue-200" : isSelected ? "bg-blue-600" : "bg-blue-500",
            green: isActed ? "bg-green-200" : isSelected ? "bg-green-600" : "bg-green-500",
          };

          return (
            <button
              key={heli.id}
              disabled={isActed}
              onClick={() => {
                setSelectedHeliId(heli.id);
                setActionMode(null);
                context.clearSearchResult();
              }}
              className={`px-4 py-2 rounded-full text-white font-bold transition-all shadow-md ${
                bgColors[heli.color]
              } ${isActed ? "opacity-50 cursor-not-allowed" : "hover:scale-105"} ${
                isSelected ? "ring-4 ring-yellow-400" : ""
              }`}
            >
              {heliColors[heli.color]} ({heli.id})
              {isActed && " ✓"}
            </button>
          );
        })}
      </div>

      {/* アクション選択 */}
      {selectedHeli && !actionMode && (
        <div className="bg-blue-50 rounded-lg p-4 md:p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-gray-700 font-semibold mb-4">
              {heliColors[selectedHeli.color]}のヘリでどのアクションを実行しますか？
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
      {actionMode === "move" && selectedHeli && (
        <div className="bg-blue-100 rounded-lg p-4 mb-6 text-center">
          <p className="text-blue-900 font-semibold">
            隣接する交差点に移動してください
          </p>
        </div>
      )}

      {/* 検索モード */}
      {actionMode === "search" && selectedHeli && (
        <div className="bg-yellow-100 rounded-lg p-4 mb-6 text-center">
          <p className="text-yellow-900 font-semibold">
            隣接する建物を検索してください
          </p>
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
                アクション完了
              </button>
            </div>
          )}
        </div>
      )}

      {/* ターン終了ボタン */}
      {allActed && (
        <div className="text-center mb-6">
          <button
            onClick={() => context.nextTurn()}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-xl scale-110"
          >
            警察のターンを終了する
          </button>
        </div>
      )}

      {/* ボード */}
      <Board
        state={state}
        selectedHeliId={selectedHeliId}
        highlightedBuildings={searchableBuildings}
        highlightedIntersections={moveableIntersections}
        onBuildingClick={handleBuildingClick}
        onIntersectionClick={handleIntersectionClick}
      />
    </div>
  );
};
