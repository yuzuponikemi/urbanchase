/**
 * Game State Types for City Chase
 */

// ゲーム全体の状態
export interface GameState {
  phase: "mode_select" | "setup_police_heli" | "setup_criminal_building" | "playing" | "gameover";
  round: number; // 1-11
  board: Board;
  currentPlayer: "criminal" | "police"; // ターン制
  criminal: CriminalState;
  police: PoliceState;
  traceMarkers: TraceMarker[]; // 配置した痕跡
  isTurnTransition: boolean;
  winner: "criminal_win" | "police_win" | null;
  gameMode: "human_vs_human" | "human_vs_ai"; // ゲームモード
  aiDifficulty: "easy" | "medium" | "hard"; // AI難易度
}

// ボード（5x5建物 + 4x4交差点）
export interface Board {
  // 建物と交差点の位置情報は静的
}

// 容疑者の状態
export interface CriminalState {
  hideBuilding: { x: number; y: number }; // 隠れている建物（5x5座標）
  currentLocation: { x: number; y: number }; // 現在いる建物
  isDiscovered: boolean;
}

// 警察の状態
export interface PoliceState {
  helicopters: Helicopter[]; // 3つのヘリ
  lastSearchResult: SearchResult | null;
  actedHeliIds: (1 | 2 | 3)[]; // ターン内で行動済みのヘリID
}

// ヘリコプター（3つ、色分け）
export interface Helicopter {
  id: 1 | 2 | 3;
  color: "red" | "blue" | "green";
  location: { x: number; y: number }; // 交差点座標(4x4)
}

// 痕跡マーカー
export interface TraceMarker {
  round: number; // 1-11
  location: { x: number; y: number }; // 建物座標(5x5)
  color: "normal" | "special"; // round=1 or round=6 は "special"
  isRevealed: boolean; // 警察に見つかった、または特殊ラウンド
}

// 検索結果
export type SearchResult = "nothing" | "trace" | "found" | "no_building";

// Game Context のメソッド型
export type GameContextType = {
  state: GameState;

  // ゲームモード選択
  setGameMode: (gameMode: "human_vs_human" | "human_vs_ai", difficulty?: "easy" | "medium" | "hard") => void;

  // セットアップ
  placeHelicopter: (heliId: 1 | 2 | 3, x: number, y: number) => void;
  setCriminalHideBuilding: (x: number, y: number) => void;
  startGame: () => void;

  // 容疑者ターン
  moveCriminal: (x: number, y: number) => boolean;

  // 警察ターン
  moveHelicopter: (heliId: 1 | 2 | 3, x: number, y: number) => boolean;
  searchAdjacentBuilding: (heliId: 1 | 2 | 3, bx: number, by: number) => SearchResult;
  clearSearchResult: () => void;
  completeHeliAction: (heliId: 1 | 2 | 3) => void;
  startTurn: () => void;


  // ターン進行
  nextTurn: () => void;

  // ゲーム終了判定
  checkWinCondition: () => "criminal_win" | "police_win" | null;
};
