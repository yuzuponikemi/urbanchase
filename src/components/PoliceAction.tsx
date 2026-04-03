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
  const [pendingAction, setPendingAction] = useState<{
    type: "move" | "search";
    x: number;
    y: number;
    pxX: number;
    pxY: number;
  } | null>(null);

  const selectedHeli = state.police.helicopters.find((h) => h.id === selectedHeliId);
  const heliColors: Record<string, string> = {
    red: "赤",
    blue: "青",
    green: "緑",
  };

  const hasSearchResult = !!state.police.lastSearchResult;

  // 選択中ヘリの隣接建物と交差点を常に表示（検索結果が表示されていない時）
  const searchableBuildings =
    selectedHeli && !hasSearchResult
      ? getAdjacentBuildings(selectedHeli.location.x, selectedHeli.location.y)
      : [];

  const moveableIntersections =
    selectedHeli && !hasSearchResult
      ? getAdjacentIntersectionsFromIntersection(selectedHeli.location.x, selectedHeli.location.y)
      : [];

  const handleBuildingClick = (x: number, y: number, pxX: number, pxY: number) => {
    if (selectedHeliId && !hasSearchResult) {
      // 隣接チェック
      const isAdjacent = searchableBuildings.some(b => b.x === x && b.y === y);
      if (isAdjacent) {
        setPendingAction({ type: "search", x, y, pxX, pxY });
      }
    }
  };

  const handleIntersectionClick = (x: number, y: number, pxX: number, pxY: number) => {
    // 既にそこにいるヘリを選択
    const clickedHeli = state.police.helicopters.find(
      (h) => h.location.x === x && h.location.y === y
    );

    if (clickedHeli) {
      if (state.police.actedHeliIds.includes(clickedHeli.id)) return;
      setSelectedHeliId(clickedHeli.id);
      setPendingAction(null);
      context.clearSearchResult();
      return;
    }

    if (selectedHeliId && !hasSearchResult) {
      const isMoveable = moveableIntersections.some(i => i.x === x && i.y === y);
      if (isMoveable) {
        setPendingAction({ type: "move", x, y, pxX, pxY });
      }
    }
  };

  const confirmAction = () => {
    if (!pendingAction || !selectedHeliId) return;

    if (pendingAction.type === "move") {
      const moved = context.moveHelicopter(selectedHeliId, pendingAction.x, pendingAction.y);
      if (moved) {
        completeHeliAction();
      }
    } else {
      context.searchAdjacentBuilding(selectedHeliId, pendingAction.x, pendingAction.y);
    }
    setPendingAction(null);
  };

  const completeHeliAction = () => {
    if (selectedHeliId) {
      context.completeHeliAction(selectedHeliId);
      setSelectedHeliId(null);
      setPendingAction(null);
      context.clearSearchResult();
    }
  };

  const allActed = state.police.actedHeliIds.length === 3;

  return (
    <div className="w-full relative">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
          ラウンド {state.round} - 警察のターン
        </h2>
        {!allActed ? (
          <p className="text-gray-600 text-lg">
            {selectedHeliId 
              ? "移動先または検索するビルをタップしてください" 
              : "操作するヘリを選択してください"}
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
                setPendingAction(null);
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

      {/* 検索結果表示 */}
      {hasSearchResult && (
        <div className="flex justify-center mb-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-white border-2 border-yellow-400 rounded-xl p-4 shadow-xl text-center max-w-sm w-full">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">検索結果</div>
            <div
              className={`text-xl font-bold mb-4 ${
                state.police.lastSearchResult === "found"
                  ? "text-red-600"
                  : state.police.lastSearchResult === "trace"
                  ? "text-yellow-700"
                  : "text-green-600"
              }`}
            >
              {state.police.lastSearchResult === "found" && "🎯 容疑者を発見！"}
              {state.police.lastSearchResult === "trace" && "⚠️ 痕跡あり（不在）"}
              {state.police.lastSearchResult === "nothing" && "✅ 痕跡なし"}
            </div>
            <button
              onClick={() => completeHeliAction()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md"
            >
              了解
            </button>
          </div>
        </div>
      )}

      {/* ターン終了ボタン */}
      {allActed && !hasSearchResult && (
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
      <div className="relative inline-block w-full">
        <Board
          state={state}
          selectedHeliId={selectedHeliId}
          highlightedBuildings={searchableBuildings}
          highlightedIntersections={moveableIntersections}
          onBuildingClick={handleBuildingClick}
          onIntersectionClick={handleIntersectionClick}
        />

        {/* 確認ダイアログ (オーバーレイ) */}
        {pendingAction && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: `${pendingAction.pxX}px`,
              top: `${pendingAction.pxY}px`,
              transform: 'translate(-50%, -110%)'
            }}
          >
            <div className="pointer-events-auto bg-white border-2 border-blue-500 rounded-lg shadow-2xl p-2 flex flex-col items-center gap-2 animate-in slide-in-from-bottom-2 duration-200 min-w-[140px]">
              <div className="text-xs font-bold text-gray-700 whitespace-nowrap">
                {pendingAction.type === "move" ? "ここに移動しますか？" : "このビルを確認しますか？"}
              </div>
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => setPendingAction(null)}
                  className="flex-1 py-1 px-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded"
                >
                  取消
                </button>
                <button 
                  onClick={confirmAction}
                  className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded"
                >
                  確定
                </button>
              </div>
              {/* 吹き出しの三角 */}
              <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-blue-500"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
