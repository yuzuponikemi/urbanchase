/**
 * Game Rules Implementation
 */

import type { GameState, TraceMarker, SearchResult } from "./types";
import {
  isAdjacentBuilding,
  isAdjacentIntersection,
  isValidIntersectionPos,
  getAdjacentBuildings,
} from "./boardGeometry";

/**
 * 容疑者が移動可能か判定
 */
export function canCriminalMove(
  from: { x: number; y: number },
  to: { x: number; y: number },
  state: GameState
): boolean {
  // 隣接建物か
  if (!isAdjacentBuilding(from, to)) {
    return false;
  }

  // 痕跡位置（訪れたことのある場所）には移動不可
  const hasTrace = state.traceMarkers.some((m) => m.location.x === to.x && m.location.y === to.y);
  if (hasTrace) {
    return false;
  }

  return true;
}

/**
 * 容疑者が移動を実行
 */
export function executeCriminalMove(newPos: { x: number; y: number }, state: GameState): GameState {
  const origin = state.criminal.currentLocation;
  const isSpecial = state.round === 1 || state.round === 6;
  const color = isSpecial ? "special" : "normal";
  const newTrace: TraceMarker = {
    round: state.round,
    location: { ...origin }, // 移動元の場所に痕跡を残す
    color,
    isRevealed: false, // 検索で見つかるまで警察からは見えない
  };

  return {
    ...state,
    criminal: {
      ...state.criminal,
      currentLocation: { ...newPos },
    },
    traceMarkers: [...state.traceMarkers, newTrace],
  };
}

/**
 * 警察がヘリを移動可能か判定
 */
export function canMoveHelicopter(
  heliId: 1 | 2 | 3,
  to: { x: number; y: number },
  state: GameState
): boolean {
  const heli = state.police.helicopters.find((h) => h.id === heliId);
  if (!heli) return false;

  return isAdjacentIntersection(heli.location, to) && isValidIntersectionPos(to.x, to.y);
}

/**
 * 警察がヘリを移動実行
 */
export function executeHelicopterMove(
  heliId: 1 | 2 | 3,
  to: { x: number; y: number },
  state: GameState
): GameState {
  const newState = { ...state };
  const heli = newState.police.helicopters.find((h) => h.id === heliId);
  if (heli) {
    heli.location = { ...to };
  }
  return newState;
}

/**
 * 警察が隣接建物を検索
 */
export function searchAdjacentBuilding(
  heliX: number,
  heliY: number,
  bx: number,
  by: number,
  state: GameState
): SearchResult {
  // ヘリから隣接する建物か判定
  const adjacentBuildings = getAdjacentBuildings(heliX, heliY);
  const isAdjacent = adjacentBuildings.some((b) => b.x === bx && b.y === by);

  if (!isAdjacent) {
    return "no_building";
  }

  // 容疑者の現在位置と比較
  if (
    state.criminal.currentLocation.x === bx &&
    state.criminal.currentLocation.y === by
  ) {
    return "found";
  }

  // 痕跡あるが容疑者いない
  const hasTrace = state.traceMarkers.some((m) => m.location.x === bx && m.location.y === by);
  if (hasTrace) {
    return "trace";
  }

  return "nothing";
}

/**
 * ゲーム終了判定
 */
export function checkWinCondition(state: GameState): "criminal_win" | "police_win" | null {
  // 容疑者が発見された
  if (state.criminal.isDiscovered) {
    return "police_win";
  }

  // 容疑者が11ラウンド逃げ切った
  if (state.round > 11) {
    return "criminal_win";
  }

  return null;
}
