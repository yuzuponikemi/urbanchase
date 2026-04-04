/**
 * AI Player Logic for City Chase
 * Criminal AI with escape route priority strategy
 */

import type { GameState } from "./types";
import { isValidBuildingPos, getAdjacentIntersections } from "./boardGeometry";
import { canCriminalMove } from "./gameRules";

export class CriminalAI {
  difficulty: "easy" | "medium" | "hard";

  constructor(difficulty: "easy" | "medium" | "hard") {
    this.difficulty = difficulty;
  }

  /**
   * 容疑者が移動する建物を決定
   * 戦略：逃げ道優先（次ターン以降の選択肢最大化を優先）
   */
  decideMoveTarget(state: GameState): { x: number; y: number } {
    const currentPos = state.criminal.currentLocation;

    // 1. 移動可能な隣接建物を列挙
    const adjacentBuildings = [
      { x: currentPos.x - 1, y: currentPos.y },
      { x: currentPos.x + 1, y: currentPos.y },
      { x: currentPos.x, y: currentPos.y - 1 },
      { x: currentPos.x, y: currentPos.y + 1 },
    ].filter((pos) =>
      isValidBuildingPos(pos.x, pos.y) &&
      canCriminalMove(currentPos, pos, state)
    );

    if (adjacentBuildings.length === 0) {
      // 移動可能な場所がない（通常はこの状況は起こらない）
      return currentPos;
    }

    // 2. 各候補建物をスコア付け（逃げ道優先戦略）
    const scored = adjacentBuildings.map((building) => {
      let score = 0;

      // **スコア1（最優先）：逃げ道の多さ**
      // その建物から次ターン移動可能な隣接建物の数
      const nextAdjacentBuildings = [
        { x: building.x - 1, y: building.y },
        { x: building.x + 1, y: building.y },
        { x: building.x, y: building.y - 1 },
        { x: building.x, y: building.y + 1 },
      ].filter((pos) => isValidBuildingPos(pos.x, pos.y));

      const availableNextMoves = nextAdjacentBuildings.filter((pos) => {
        // 痕跡がない場所のみカウント
        return !state.traceMarkers.some(
          (m) => m.location.x === pos.x && m.location.y === pos.y
        );
      }).length;

      score += availableNextMoves * 10; // 逃げ道スコア（重要度最高）

      // **スコア2（参考値）：脅威度の低さ**
      // その建物に隣接する交差点に何個のヘリがいるか
      const adjacentIntersections = getAdjacentIntersections(building.x, building.y);
      const heliCount = state.police.helicopters.filter((heli) =>
        adjacentIntersections.some((inter) => inter.x === heli.location.x && inter.y === heli.location.y)
      ).length;

      // ヘリが多いほどスコア減少（脅威度が高い = スコア低い）
      score -= heliCount * 1; // 脅威度スコア（参考値のみ）

      return { building, score };
    });

    // 3. 難易度に応じた選択
    return this.selectByDifficulty(scored);
  }

  /**
   * 難易度に応じてスコアベースの選択を実行
   */
  private selectByDifficulty(
    candidates: Array<{ building: { x: number; y: number }; score: number }>
  ): { x: number; y: number } {
    if (candidates.length === 0) {
      // フォールバック：最初の候補
      return candidates[0].building;
    }

    // スコアでソート（降順）
    const sorted = [...candidates].sort((a, b) => b.score - a.score);

    switch (this.difficulty) {
      case "easy":
        // Easy: 40%の確率で非最適な選択をする
        if (Math.random() < 0.4 && sorted.length > 1) {
          // ランダムに選択（上位から外す可能性もある）
          const randomIndex = Math.floor(Math.random() * (sorted.length - 1)) + 1;
          return sorted[randomIndex].building;
        }
        // それ以外は最善手
        return sorted[0].building;

      case "medium":
        // Medium: 20%の確率で非最適な選択をする
        if (Math.random() < 0.2 && sorted.length > 1) {
          const randomIndex = Math.floor(Math.random() * (sorted.length - 1)) + 1;
          return sorted[randomIndex].building;
        }
        // それ以外は最善手
        return sorted[0].building;

      case "hard":
      default:
        // Hard: 常に最善手（スコアが最も高い）
        return sorted[0].building;
    }
  }
}
