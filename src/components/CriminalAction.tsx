/**
 * Criminal Action Component
 * 容疑者の移動UI
 */

import React from "react";
import type { GameState, GameContextType } from "../logic/types";
import { Board } from "./Board";
import { canCriminalMove } from "../logic/gameRules";

interface CriminalActionProps {
  state: GameState;
  context: GameContextType;
}

export const CriminalAction: React.FC<CriminalActionProps> = ({ state, context }) => {
  const currentLoc = state.criminal.currentLocation;

  const handleBuildingClick = (x: number, y: number) => {
    // 共通のルールエンジンで移動可能かチェック
    const to = { x, y };
    if (canCriminalMove(currentLoc, to, state)) {
      context.moveCriminal(x, y);
      context.nextTurn();
    }
  };

  const handleIntersectionClick = () => {
    // 容疑者は交差点をクリックしない
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-4">
          ラウンド {state.round} - 容疑者のターン
        </h2>
        <p className="text-gray-600 text-lg">
          隣接する建物に移動してください（上下左右のいずれか）
        </p>
        <div className="mt-2 text-sm text-gray-500">
          現在地: 建物 ({currentLoc.x}, {currentLoc.y})
        </div>
      </div>

      <Board
        state={state}
        onBuildingClick={handleBuildingClick}
        onIntersectionClick={handleIntersectionClick}
      />

      <div className="text-center mt-6">
        <div className="text-sm text-blue-600 font-semibold">
          💡 青くハイライトされた建物に移動できます
        </div>
      </div>
    </div>
  );
};
