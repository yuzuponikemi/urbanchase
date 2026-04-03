/**
 * Board Component - Canvas-based rendering
 * 5x5建物マス + 4x4交差点の描画
 */

import React, { useEffect, useRef } from "react";
import type { GameState } from "../logic/types";
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  INTERSECTION_WIDTH,
  INTERSECTION_HEIGHT,
} from "../logic/boardGeometry";

interface BoardProps {
  state: GameState;
  selectedHeliId?: 1 | 2 | 3 | null;
  highlightedBuildings?: Array<{ x: number; y: number }>;
  onBuildingClick: (x: number, y: number) => void;
  onIntersectionClick: (x: number, y: number) => void;
}

const CELL_SIZE = 50; // ピクセル
const PADDING = 40;
const CANVAS_WIDTH = BOARD_WIDTH * CELL_SIZE + PADDING * 2;
const CANVAS_HEIGHT = BOARD_HEIGHT * CELL_SIZE + PADDING * 2;

export const Board: React.FC<BoardProps> = ({ state, selectedHeliId, highlightedBuildings, onBuildingClick, onIntersectionClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = React.useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  // レスポンシブ対応
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const parentWidth = canvas.parentElement?.clientWidth || window.innerWidth;
        const scale = Math.min(1, (parentWidth - 40) / CANVAS_WIDTH);
        const newWidth = CANVAS_WIDTH * scale;
        const newHeight = CANVAS_HEIGHT * scale;

        canvas.width = newWidth;
        canvas.height = newHeight;
        setCanvasSize({ width: newWidth, height: newHeight });

        redrawBoard();
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ボード描画
  const redrawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = canvasSize.width / CANVAS_WIDTH;
    const cellSize = CELL_SIZE * scale;
    const padding = PADDING * scale;

    // 背景
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 建物マス（5x5）
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 2;

    for (let i = 0; i < BOARD_WIDTH; i++) {
      for (let j = 0; j < BOARD_HEIGHT; j++) {
        const x = padding + i * cellSize;
        const y = padding + j * cellSize;

        // 検索可能建物のハイライト（警察の検索モード時）
        const isSearchable = highlightedBuildings?.some((b) => b.x === i && b.y === j) ?? false;

        // 選択可能な建物を強調（犯人ターン）
        const isAdjacentToCriminal =
          state.currentPlayer === "criminal" &&
          Math.abs(i - state.criminal.currentLocation.x) +
          Math.abs(j - state.criminal.currentLocation.y) ===
          1;

        if (isSearchable) {
          ctx.fillStyle = "#fef3c7"; // 薄い黄色
          ctx.fillRect(x, y, cellSize, cellSize);
          // 枠線でさらに強調
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 2;
        } else if (isAdjacentToCriminal) {
          ctx.fillStyle = "#dbeafe";
          ctx.fillRect(x, y, cellSize, cellSize);
        }

        ctx.strokeRect(x, y, cellSize, cellSize);

        // 痕跡マーカー
        const trace = state.traceMarkers.find((m) => m.location.x === i && m.location.y === j);
        const isCriminalCurrentPos = state.criminal.currentLocation.x === i && state.criminal.currentLocation.y === j;
        if (trace) {
          // 表示条件:
          // 1. 容疑者ターン: すべての痕跡が見える
          // 2. 警察ターン: isRevealed (検索済み) の痕跡のみ見える
          const shouldShowTrace = state.currentPlayer === "criminal" || trace.isRevealed;

          if (shouldShowTrace) {
            ctx.fillStyle = trace.color === "special" ? "#fbbf24" : "#e5e7eb";
            ctx.fillRect(x + cellSize * 0.2, y + cellSize * 0.2, cellSize * 0.6, cellSize * 0.6);

            // 凡人（容疑者）ターン: 現在位置以外の痕跡にラウンド番号を描画
            if (state.currentPlayer === "criminal" && !isCriminalCurrentPos) {
              ctx.fillStyle = trace.color === "special" ? "#92400e" : "#374151";
              ctx.font = `bold ${12 * scale}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(String(trace.round), x + cellSize / 2, y + cellSize / 2);
            }
          }
        }

        // 容疑者の位置
        if (isCriminalCurrentPos) {
          // 表示条件: 
          // 1. 容疑者ターンの時
          // 2. セットアップ中 (setup_criminal_building)
          // 3. 警察に見つかった時 (isDiscovered)
          // 4. ゲームオーバーの時
          const shouldShowCriminal =
            state.currentPlayer === "criminal" ||
            state.phase === "setup_criminal_building" ||
            state.criminal.isDiscovered ||
            state.phase === "gameover";

          if (shouldShowCriminal) {
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.25, 0, Math.PI * 2);
            ctx.fill();

            // 犯人ターン: 現在位置の痕跡ラウンド番号を赤丸の上に表示
            if (state.currentPlayer === "criminal" && trace) {
              ctx.fillStyle = "#fff";
              ctx.font = `bold ${11 * scale}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(String(trace.round), x + cellSize / 2, y + cellSize / 2);
            }
          }
        }
      }
    }

    // 交差点（4x4）
    ctx.fillStyle = "#6b7280";
    for (let i = 0; i < INTERSECTION_WIDTH; i++) {
      for (let j = 0; j < INTERSECTION_HEIGHT; j++) {
        const x = padding + cellSize * (i + 1);
        const y = padding + cellSize * (j + 1);

        ctx.beginPath();
        ctx.arc(x, y, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ヘリコプター
    const heliColors: Record<string, string> = {
      red: "#ef4444",
      blue: "#3b82f6",
      green: "#10b981",
    };

    for (const heli of state.police.helicopters) {
      if (heli.location.x < 0 || heli.location.y < 0) continue;
      const x = padding + cellSize * (heli.location.x + 1);
      const y = padding + cellSize * (heli.location.y + 1);

      const isActed = state.police.actedHeliIds.includes(heli.id);
      const isSelected = selectedHeliId === heli.id;

      // 行動済みは半透明に
      ctx.globalAlpha = isActed ? 0.4 : 1.0;
      
      // 選択中を強調
      if (isSelected) {
        ctx.strokeStyle = "#fbbf24"; // ゴールド
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.arc(x, y, 16 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = heliColors[heli.color] || "#6b7280";
      ctx.beginPath();
      ctx.arc(x, y, 12 * scale, 0, Math.PI * 2);
      ctx.fill();

      // ヘリ ID
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${14 * scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(heli.id), x, y);
      
      ctx.globalAlpha = 1.0;
    }
  };

  // キャンバスをクリック
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const scale = canvasSize.width / CANVAS_WIDTH;
    const cellSize = CELL_SIZE * scale;
    const padding = PADDING * scale;

    // 交差点クリック判定（建物より優先）
    for (let i = 0; i < INTERSECTION_WIDTH; i++) {
      for (let j = 0; j < INTERSECTION_HEIGHT; j++) {
        const ix = padding + cellSize * (i + 1);
        const iy = padding + cellSize * (j + 1);
        const distance = Math.sqrt((x - ix) ** 2 + (y - iy) ** 2);

        if (distance < 20 * scale) { // 判定を少し広く
          onIntersectionClick(i, j);
          return;
        }
      }
    }

    // 建物クリック判定
    const buildingX = Math.floor((x - padding) / cellSize);
    const buildingY = Math.floor((y - padding) / cellSize);

    if (buildingX >= 0 && buildingX < BOARD_WIDTH && buildingY >= 0 && buildingY < BOARD_HEIGHT) {
      onBuildingClick(buildingX, buildingY);
      return;
    }
  };

  // ボード再描画（state変更時）
  useEffect(() => {
    redrawBoard();
  }, [state, canvasSize]);

  return (
    <div className="flex justify-center items-center p-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
        className="border-2 border-gray-300 rounded-lg cursor-pointer bg-white shadow-lg"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  );
};
