/**
 * Game State Management with React Context
 */

import { createContext, useContext, useReducer } from "react";
import type { GameState, GameContextType, TraceMarker } from "./types";
import {
  canCriminalMove,
  executeCriminalMove,
  canMoveHelicopter,
  searchAdjacentBuilding,
  checkWinCondition,
} from "./gameRules";
import { isValidIntersectionPos, isValidBuildingPos } from "./boardGeometry";

const initialGameState: GameState = {
  phase: "setup_police_heli",
  round: 1,
  board: {},
  currentPlayer: "police",
  criminal: {
    hideBuilding: { x: -1, y: -1 },
    currentLocation: { x: -1, y: -1 },
    isDiscovered: false,
  },
  police: {
    helicopters: [
      { id: 1, color: "red", location: { x: -1, y: -1 } },
      { id: 2, color: "blue", location: { x: -1, y: -1 } },
      { id: 3, color: "green", location: { x: -1, y: -1 } },
    ],
    lastSearchResult: null,
    actedHeliIds: [],
  },
  traceMarkers: [],
  isTurnTransition: false,
  winner: null,
};

type GameAction =
  | { type: "PLACE_HELICOPTER"; heliId: 1 | 2 | 3; x: number; y: number }
  | { type: "SET_CRIMINAL_HIDE_BUILDING"; x: number; y: number }
  | { type: "START_GAME" }
  | { type: "MOVE_CRIMINAL"; x: number; y: number }
  | { type: "MOVE_HELICOPTER"; heliId: 1 | 2 | 3; x: number; y: number }
  | { type: "SEARCH_BUILDING"; heliId: 1 | 2 | 3; bx: number; by: number }
  | { type: "CLEAR_SEARCH_RESULT" }
  | { type: "COMPLETE_HELI_ACTION"; heliId: 1 | 2 | 3 }
  | { type: "START_TURN" }
  | { type: "NEXT_TURN" }
  | { type: "RESET_GAME" };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "PLACE_HELICOPTER": {
      if (!isValidIntersectionPos(action.x, action.y)) return state;

      // 他のヘリが既にそこにいないかチェック（自分自身は除く）
      const isOccupied = state.police.helicopters.some(
        (h) => h.id !== action.heliId && h.location.x === action.x && h.location.y === action.y
      );
      if (isOccupied) return state;

      const newHelicopters = state.police.helicopters.map((h) =>
        h.id === action.heliId ? { ...h, location: { x: action.x, y: action.y } } : h
      );

      const allPlaced = newHelicopters.every(
        (h) => h.location.x >= 0 && h.location.y >= 0
      );

      return {
        ...state,
        phase: allPlaced ? "setup_criminal_building" : state.phase,
        currentPlayer: allPlaced ? "criminal" : state.currentPlayer,
        police: {
          ...state.police,
          helicopters: newHelicopters,
        },
      };
    }

    case "SET_CRIMINAL_HIDE_BUILDING": {
      if (!isValidBuildingPos(action.x, action.y)) return state;
      return {
        ...state,
        criminal: {
          ...state.criminal,
          hideBuilding: { x: action.x, y: action.y },
          currentLocation: { x: action.x, y: action.y },
        },
      };
    }

    case "START_GAME": {
      const startingPos = state.criminal.hideBuilding;
      const initialTrace: TraceMarker = {
        round: 1,
        location: { ...startingPos },
        color: "special",
        isRevealed: false,
      };
      return {
        ...state,
        phase: "playing",
        round: 1,
        currentPlayer: "police",
        traceMarkers: [initialTrace],
        isTurnTransition: true,
      };
    }

    case "MOVE_CRIMINAL": {
      if (state.phase !== "playing" || state.currentPlayer !== "criminal") {
        return state;
      }
      const to = { x: action.x, y: action.y };
      if (!canCriminalMove(state.criminal.currentLocation, to, state)) {
        return state;
      }
      return executeCriminalMove(to, state);
    }

    case "MOVE_HELICOPTER": {
      if (state.phase !== "playing" || state.currentPlayer !== "police") {
        return state;
      }

      // 他のヘリが既にそこにいないかチェック
      const isOccupied = state.police.helicopters.some(
        (h) => h.id !== action.heliId && h.location.x === action.x && h.location.y === action.y
      );
      if (isOccupied) return state;

      const to = { x: action.x, y: action.y };
      if (!canMoveHelicopter(action.heliId, to, state)) {
        return state;
      }
      return {
        ...state,
        police: {
          ...state.police,
          helicopters: state.police.helicopters.map((h) =>
            h.id === action.heliId ? { ...h, location: { ...to } } : h
          ),
        },
      };
    }

    case "SEARCH_BUILDING": {
      if (state.phase !== "playing" || state.currentPlayer !== "police") {
        return state;
      }
      const heli = state.police.helicopters.find((h) => h.id === action.heliId);
      if (!heli) return state;
      const result = searchAdjacentBuilding(heli.location.x, heli.location.y, action.bx, action.by, state);

      const newTraceMarkers = state.traceMarkers.map(m =>
        (m.location.x === action.bx && m.location.y === action.by && (result === "found" || result === "trace"))
          ? { ...m, isRevealed: true }
          : m
      );

      return {
        ...state,
        traceMarkers: newTraceMarkers,
        police: {
          ...state.police,
          lastSearchResult: result,
        },
        criminal: {
          ...state.criminal,
          isDiscovered: result === "found" ? true : state.criminal.isDiscovered,
        },
      };
    }

    case "CLEAR_SEARCH_RESULT": {
      return {
        ...state,
        police: {
          ...state.police,
          lastSearchResult: null,
        },
      };
    }

    case "COMPLETE_HELI_ACTION": {
      if (state.police.actedHeliIds.includes(action.heliId)) return state;
      return {
        ...state,
        police: {
          ...state.police,
          actedHeliIds: [...state.police.actedHeliIds, action.heliId],
        },
      };
    }

    case "START_TURN": {
      return {
        ...state,
        isTurnTransition: false,
      };
    }

    case "NEXT_TURN": {
      if (state.phase !== "playing") return state;

      let nextPlayer = state.currentPlayer === "criminal" ? "police" : "criminal";
      let nextRound = state.currentPlayer === "police" ? state.round + 1 : state.round;

      const newState: GameState = {
        ...state,
        currentPlayer: nextPlayer as "criminal" | "police",
        round: nextRound,
        isTurnTransition: true,
        police: {
          ...state.police,
          lastSearchResult: null,
          actedHeliIds: [],
        },
      };

      // ゲーム終了判定
      const winner = checkWinCondition(newState);
      if (winner) {
        return {
          ...newState,
          phase: "gameover",
          winner,
        };
      }

      return newState;
    }

    case "RESET_GAME": {
      return { ...initialGameState };
    }

    default:
      return state;
  }
}

export const GameContext = createContext<GameContextType | null>(null);

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameProvider");
  }
  return context;
}

// Context Provider コンポーネント（App.tsx で使用）
export function createGameContextValue(): GameContextType {
  // 注: これはReact Hooksが必要なため、実際にはuseGameProviderで実装
  throw new Error("Use useGameProvider instead");
}

// Custom Hook for managing game state
export function useGameProvider() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const contextValue: GameContextType = {
    state,

    placeHelicopter: (heliId, x, y) => {
      dispatch({ type: "PLACE_HELICOPTER", heliId, x, y });
    },

    setCriminalHideBuilding: (x, y) => {
      dispatch({ type: "SET_CRIMINAL_HIDE_BUILDING", x, y });
    },

    startGame: () => {
      dispatch({ type: "START_GAME" });
    },

    moveCriminal: (x, y) => {
      dispatch({ type: "MOVE_CRIMINAL", x, y });
      return true;
    },

    moveHelicopter: (heliId, x, y) => {
      dispatch({ type: "MOVE_HELICOPTER", heliId, x, y });
      return true;
    },

    searchAdjacentBuilding: (heliId, bx, by) => {
      dispatch({ type: "SEARCH_BUILDING", heliId, bx, by });
      return "nothing";
    },

    clearSearchResult: () => {
      dispatch({ type: "CLEAR_SEARCH_RESULT" });
    },

    completeHeliAction: (heliId) => {
      dispatch({ type: "COMPLETE_HELI_ACTION", heliId });
    },

    startTurn: () => {
      dispatch({ type: "START_TURN" });
    },

    nextTurn: () => {
      dispatch({ type: "NEXT_TURN" });
    },

    checkWinCondition: () => {
      return state.winner || null;
    },
  };

  return contextValue;
}
