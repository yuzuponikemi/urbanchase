/**
 * Game Rules Implementation
 */

import type { GameState, TraceMarker, SearchResult, Helicopter } from "./types";
import {
  isAdjacentBuilding,
  isAdjacentIntersection,
  isValidBuildingPos,
  isValidIntersectionPos,
  getAdjacentIntersections,
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

  // 前ラウンドの痕跡位置には移動不可
  if (state.round > 1) {
    const prevTrace = state.traceMarkers.find((m) => m.round === state.round - 1);
    if (prevTrace && prevTrace.location.x === to.x && prevTrace.location.y === to.y) {
      return false;
    }
  }

  return true;
}

/**
 * 容疑者が移動を実行
 */
export function executeCriminalMove(newPos: { x: number; y: number }, state: GameState): GameState {
  const color = state.round === 1 || state.round === 6 ? "special" : "normal";
  const newTrace: TraceMarker = {
    round: state.round,
    location: { ...newPos },
    color,
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

  // 容疑者が追い詰められた（全隣接建物がヘリで塞がれている）
  if (canCriminalBeBoxed(state)) {
    return "police_win";
  }

  // 容疑者が11ラウンド逃げ切った
  if (state.round > 11) {
    return "criminal_win";
  }

  return null;
}

/**
 * 容疑者が追い詰められているか判定
 */
export function canCriminalBeBoxed(state: GameState): boolean {
  const { x: cx, y: cy } = state.criminal.currentLocation;
  const adjacentBuildings = [
    { x: cx - 1, y: cy },
    { x: cx + 1, y: cy },
    { x: cx, y: cy - 1 },
    { x: cx, y: cy + 1 },
  ].filter(({ x, y }) => isValidBuildingPos(x, y));

  if (adjacentBuildings.length === 0) {
    return true; // 隣接建物がない = 追い詰められた
  }

  // すべての隣接建物がヘリで塞がれているか確認
  for (const building of adjacentBuildings) {
    const adjacentIntersections = getAdjacentIntersections(building.x, building.y);
    const hasHeli = state.police.helicopters.some((heli) =>
      adjacentIntersections.some((inter) => inter.x === heli.location.x && inter.y === heli.location.y)
    );
    if (!hasHeli) {
      return false; // この建物に到達できる = 逃げられる
    }
  }

  return true; // すべて塞がれている
}
