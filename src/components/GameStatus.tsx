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

export const GameStatus: React.FC<GameStatusProps> = ({ state, context }) => {
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
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* ラウンド表示 */}
        <div className="text-center">
          <div className="text-gray-600 text-sm font-semibold">ラウンド</div>
          <div className="text-3xl md:text-4xl font-bold text-blue-600">
            {state.round}
          </div>
          <div className="text-xs text-gray-500">/ 11</div>
        </div>

        {/* 現在のプレイヤー */}
        <div className="text-center">
          <div className="text-gray-600 text-sm font-semibold">現在</div>
          <div
            className={`text-3xl md:text-4xl font-bold ${
              state.currentPlayer === "criminal" ? "text-red-600" : "text-blue-600"
            }`}
          >
            {state.currentPlayer === "criminal" ? "🚗" : "🚁"}
          </div>
          <div className="text-xs text-gray-500">{getPlayerName()}</div>
        </div>

        {/* 痕跡数 */}
        <div className="text-center">
          <div className="text-gray-600 text-sm font-semibold">痕跡</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-700">
            {allTraces}
          </div>
          <div className="text-xs text-gray-500">配置済み</div>
        </div>

        {/* 特殊痕跡 */}
        <div className="text-center">
          <div className="text-gray-600 text-sm font-semibold">特殊痕跡</div>
          <div className="text-3xl md:text-4xl font-bold text-yellow-600">
            {specialTraces.length}
          </div>
          <div className="text-xs text-gray-500">
            {specialTraces.length === 0 && "未発見"}
            {specialTraces.length === 1 && "1個発見"}
            {specialTraces.length === 2 && "全て発見"}
          </div>
        </div>
      </div>

      {/* ゲーム状態情報 */}
      {state.phase === "playing" && (
        <div className="mt-6 text-center border-t pt-4">
          <div className="text-lg font-semibold text-gray-800">{getPhaseDescription()}</div>
          {state.police.lastSearchResult && (
            <div className="mt-2 text-sm">
              <div className="font-semibold text-gray-700">検索結果:</div>
              <div
                className={`text-base font-bold ${
                  state.police.lastSearchResult === "found"
                    ? "text-red-600"
                    : state.police.lastSearchResult === "empty"
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                {state.police.lastSearchResult === "found" && "🎯 容疑者を発見！"}
                {state.police.lastSearchResult === "empty" && "⚠️ 痕跡がありますが容疑者はいません"}
                {state.police.lastSearchResult === "no_building" && "❌ 隣接していない建物です"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ゲームオーバー */}
      {state.phase === "gameover" && (
        <div className="mt-6 text-center border-t pt-4">
          <div
            className={`text-2xl md:text-3xl font-bold mb-4 ${
              state.winner === "criminal_win" ? "text-green-600" : "text-red-600"
            }`}
          >
            {state.winner === "criminal_win"
              ? "🎉 容疑者の勝利！"
              : "🚨 警察の勝利！"}
          </div>
          <div className="text-gray-600">{getPhaseDescription()}</div>
        </div>
      )}
    </div>
  );
};
