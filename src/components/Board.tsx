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
  highlightedIntersections?: Array<{ x: number; y: number }>;
  onBuildingClick: (x: number, y: number) => void;
  onIntersectionClick: (x: number, y: number) => void;
}

const CELL_SIZE = 100; // マスの間隔
const BUILDING_SIZE = 70; // 建物のサイズ
const PADDING = 60;
const CANVAS_WIDTH = (BOARD_WIDTH - 1) * CELL_SIZE + BUILDING_SIZE + PADDING * 2;
const CANVAS_HEIGHT = (BOARD_HEIGHT - 1) * CELL_SIZE + BUILDING_SIZE + PADDING * 2;

export const Board: React.FC<BoardProps> = ({ state, selectedHeliId, highlightedBuildings, highlightedIntersections, onBuildingClick, onIntersectionClick }) => {
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
    const buildingSize = BUILDING_SIZE * scale;
    const padding = PADDING * scale;

    // 背景（道路の色）
    ctx.fillStyle = "#1f2937"; // Asphalt grey
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 道路の白線（グリッド状）
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.setLineDash([10 * scale, 10 * scale]);
    ctx.lineWidth = 2 * scale;

    // 縦の線
    for (let i = 0; i < BOARD_WIDTH - 1; i++) {
        const x = padding + i * cellSize + buildingSize + (cellSize - buildingSize) / 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    // 横の線
    for (let j = 0; j < BOARD_HEIGHT - 1; j++) {
        const y = padding + j * cellSize + buildingSize + (cellSize - buildingSize) / 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    const drawBuilding = (bx: number, by: number, highlightColor?: string, strokeColor?: string) => {
        const x = padding + bx * cellSize;
        const y = padding + by * cellSize;

        // 建物の影
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(x + 4 * scale, y + 4 * scale, buildingSize, buildingSize);

        // 建物本体
        ctx.fillStyle = highlightColor || "#4b5563";
        ctx.fillRect(x, y, buildingSize, buildingSize);

        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 3 * scale;
            ctx.strokeRect(x, y, buildingSize, buildingSize);
        }

        // 窓の描画
        ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
        const winSize = buildingSize / 6;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if ((bx + by + row + col) % 3 === 0) {
                    ctx.fillRect(
                        x + winSize + col * winSize * 1.8,
                        y + winSize + row * winSize * 1.8,
                        winSize,
                        winSize
                    );
                }
            }
        }
    };

    const drawSportsCar = (cx: number, cy: number, color: string) => {
        const x = padding + cx * cellSize + buildingSize / 2;
        const y = padding + cy * cellSize + buildingSize / 2;
        const carW = 35 * scale;
        const carH = 20 * scale;

        ctx.save();
        ctx.translate(x, y);

        // 車体
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(-carW / 2, -carH / 2, carW, carH, 4 * scale);
        ctx.fill();

        // 屋根
        ctx.fillStyle = "#111827";
        ctx.beginPath();
        ctx.roundRect(-carW / 4, -carH / 3, carW / 2, carH * 0.66, 2 * scale);
        ctx.fill();

        // ライト
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(carW / 2 - 4 * scale, -carH / 2 + 2 * scale, 3 * scale, 3 * scale);
        ctx.fillRect(carW / 2 - 4 * scale, carH / 2 - 5 * scale, 3 * scale, 3 * scale);

        ctx.restore();
    };

    const drawHeli = (ix: number, iy: number, baseColor: string, isActed: boolean, isSelected: boolean) => {
        const x = padding + ix * cellSize + buildingSize + (cellSize - buildingSize) / 2;
        const y = padding + iy * cellSize + buildingSize + (cellSize - buildingSize) / 2;
        const size = 20 * scale;

        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = isActed ? 0.4 : 1.0;

        if (isSelected) {
            ctx.shadowBlur = 15 * scale;
            ctx.shadowColor = "#fbbf24";
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 3 * scale;
            ctx.beginPath();
            ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // ヘリ本体
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 尾翼
        ctx.fillRect(-size * 1.4, -size * 0.1, size, size * 0.2);
        ctx.fillRect(-size * 1.4, -size * 0.3, size * 0.2, size * 0.6);

        // ローター（動いている感じの線）
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(-size * 1.2, 0);
        ctx.lineTo(size * 1.2, 0);
        ctx.moveTo(0, -size * 1.2);
        ctx.lineTo(0, size * 1.2);
        ctx.stroke();

        ctx.restore();
    };

    // 建物マス（5x5）
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 2;

    for (let i = 0; i < BOARD_WIDTH; i++) {
        for (let j = 0; j < BOARD_HEIGHT; j++) {
            // 検索可能建物のハイライト
            const isSearchable = highlightedBuildings?.some((b) => b.x === i && b.y === j) ?? false;

            // 選択可能な建物を強調（犯人ターン）
            const isAdjacentToCriminal =
                state.currentPlayer === "criminal" &&
                Math.abs(i - state.criminal.currentLocation.x) +
                Math.abs(j - state.criminal.currentLocation.y) ===
                1;

            let bgColor: string | undefined = undefined;
            let strokeColor: string | undefined = undefined;

            if (isSearchable) {
                bgColor = "#78350f"; // 暗い黄色/茶色
                strokeColor = "#fbbf24";
            } else if (isAdjacentToCriminal) {
                bgColor = "#1e3a8a"; // 暗い青
            }

            drawBuilding(i, j, bgColor, strokeColor);

            const x = padding + i * cellSize;
            const y = padding + j * cellSize;

            // 痕跡マーカー
            const trace = state.traceMarkers.find((m) => m.location.x === i && m.location.y === j);
            const isCriminalCurrentPos = state.criminal.currentLocation.x === i && state.criminal.currentLocation.y === j;
            if (trace) {
                const shouldShowTrace = state.currentPlayer === "criminal" || trace.isRevealed;

                if (shouldShowTrace) {
                    ctx.fillStyle = trace.color === "special" ? "#fbbf24" : "rgba(255, 255, 255, 0.4)";
                    // 小さな丸または番号
                    ctx.beginPath();
                    ctx.arc(x + buildingSize / 2, y + buildingSize / 2, buildingSize * 0.3, 0, Math.PI * 2);
                    ctx.fill();

                    if (state.currentPlayer === "criminal" && !isCriminalCurrentPos) {
                        ctx.fillStyle = "#000";
                        ctx.font = `bold ${14 * scale}px sans-serif`;
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(String(trace.round), x + buildingSize / 2, y + buildingSize / 2);
                    }
                }
            }

            // 容疑者の位置
            if (isCriminalCurrentPos) {
                const shouldShowCriminal =
                    state.currentPlayer === "criminal" ||
                    state.phase === "setup_criminal_building" ||
                    state.criminal.isDiscovered ||
                    state.phase === "gameover";

                if (shouldShowCriminal) {
                    drawSportsCar(i, j, "#ef4444");

                    if (state.currentPlayer === "criminal") {
                        // 現在のラウンド（移動回数）を表示
                        ctx.fillStyle = "#fff";
                        ctx.font = `bold ${14 * scale}px sans-serif`;
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
                        ctx.shadowBlur = 4 * scale;
                        ctx.fillText(String(state.round), x + buildingSize / 2, y + buildingSize / 2 - 15 * scale);
                        ctx.shadowBlur = 0;
                    }
                }
            }
        }
    }

    // 交差点（4x4）とヘリコプター
    for (let i = 0; i < INTERSECTION_WIDTH; i++) {
        for (let j = 0; j < INTERSECTION_HEIGHT; j++) {
            const x = padding + i * cellSize + buildingSize + (cellSize - buildingSize) / 2;
            const y = padding + j * cellSize + buildingSize + (cellSize - buildingSize) / 2;

            // 交差点のドット（道路の中心）
            const isHighlighted = highlightedIntersections?.some(p => p.x === i && p.y === j) ?? false;

            if (isHighlighted) {
                ctx.fillStyle = "rgba(251, 191, 36, 0.6)"; // 半透明の黄色
                ctx.beginPath();
                ctx.arc(x, y, 15 * scale, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = "#fbbf24";
                ctx.lineWidth = 2 * scale;
                ctx.stroke();
            } else {
                ctx.fillStyle = "#4b5563";
                ctx.beginPath();
                ctx.arc(x, y, 4 * scale, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    const heliColors: Record<string, string> = {
        red: "#ef4444",
        blue: "#3b82f6",
        green: "#10b981",
    };

    for (const heli of state.police.helicopters) {
        if (heli.location.x < 0 || heli.location.y < 0) continue;
        const isActed = state.police.actedHeliIds.includes(heli.id);
        const isSelected = selectedHeliId === heli.id;
        drawHeli(heli.location.x, heli.location.y, heliColors[heli.color] || "#6b7280", isActed, isSelected);
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
    const buildingSize = BUILDING_SIZE * scale;
    const padding = PADDING * scale;

    // 交差点クリック判定（建物より優先）
    for (let i = 0; i < INTERSECTION_WIDTH; i++) {
        for (let j = 0; j < INTERSECTION_HEIGHT; j++) {
            const ix = padding + i * cellSize + buildingSize + (cellSize - buildingSize) / 2;
            const iy = padding + j * cellSize + buildingSize + (cellSize - buildingSize) / 2;
            const distance = Math.sqrt((x - ix) ** 2 + (y - iy) ** 2);

            if (distance < 25 * scale) {
                onIntersectionClick(i, j);
                return;
            }
        }
    }

    // 建物クリック判定
    const bx = Math.floor((x - padding) / cellSize);
    const by = Math.floor((y - padding) / cellSize);

    if (bx >= 0 && bx < BOARD_WIDTH && by >= 0 && by < BOARD_HEIGHT) {
        // 建物矩形内かどうかを厳密にチェック
        const localX = (x - padding) % cellSize;
        const localY = (y - padding) % cellSize;
        if (localX <= buildingSize && localY <= buildingSize) {
            onBuildingClick(bx, by);
            return;
        }
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
