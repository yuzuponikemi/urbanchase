/**
 * Board Geometry
 * 5x5建物マス と 4x4交差点の座標管理
 */

// ボードサイズ
export const BOARD_WIDTH = 5; // 建物マス横
export const BOARD_HEIGHT = 5; // 建物マス縦
export const INTERSECTION_WIDTH = 4; // 交差点横
export const INTERSECTION_HEIGHT = 4; // 交差点縦

// 交差点は建物マスの間に配置される
// 建物マス (i, j) は、交差点 (x, y) に囲まれている
// 建物(0,0) の隣接交差点: (-1,-1), (-1,0), (0,-1), (0,0)
// 建物(4,4) の隣接交差点: (3,3), (3,4), (4,3), (4,4)

export function isValidBuildingPos(x: number, y: number): boolean {
  return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
}

export function isValidIntersectionPos(x: number, y: number): boolean {
  return x >= 0 && x < INTERSECTION_WIDTH && y >= 0 && y < INTERSECTION_HEIGHT;
}

/**
 * 建物に隣接する交差点のリストを取得
 * 建物(bx, by)に隣接する交差点は最大4個
 */
export function getAdjacentIntersections(bx: number, by: number): Array<{ x: number; y: number }> {
  if (!isValidBuildingPos(bx, by)) {
    return [];
  }

  const intersections = [
    { x: bx - 1, y: by - 1 }, // 左上
    { x: bx, y: by - 1 },     // 右上
    { x: bx - 1, y: by },     // 左下
    { x: bx, y: by },         // 右下
  ];

  return intersections.filter(({ x, y }) => isValidIntersectionPos(x, y));
}

/**
 * 交差点に隣接する建物のリストを取得
 * 交差点(ix, iy)に隣接する建物は最大4個
 */
export function getAdjacentBuildings(ix: number, iy: number): Array<{ x: number; y: number }> {
  if (!isValidIntersectionPos(ix, iy)) {
    return [];
  }

  const buildings = [
    { x: ix, y: iy },         // 左上
    { x: ix + 1, y: iy },     // 右上
    { x: ix, y: iy + 1 },     // 左下
    { x: ix + 1, y: iy + 1 }, // 右下
  ];

  return buildings.filter(({ x, y }) => isValidBuildingPos(x, y));
}

/**
 * 容疑者が隣接建物に移動可能か判定
 */
export function isAdjacentBuilding(from: { x: number; y: number }, to: { x: number; y: number }): boolean {
  const { x: fx, y: fy } = from;
  const { x: tx, y: ty } = to;

  // 上下左右に隣接
  return (
    (fx === tx && Math.abs(fy - ty) === 1) ||
    (fy === ty && Math.abs(fx - tx) === 1)
  );
}

/**
 * 警察がヘリで隣接交差点に移動可能か判定
 */
export function isAdjacentIntersection(from: { x: number; y: number }, to: { x: number; y: number }): boolean {
  const { x: fx, y: fy } = from;
  const { x: tx, y: ty } = to;

  // 上下左右に隣接
  return (
    (fx === tx && Math.abs(fy - ty) === 1) ||
    (fy === ty && Math.abs(fx - tx) === 1)
  );
}

/**
 * 指定した交差点に隣接する交差点のリストを取得
 */
export function getAdjacentIntersectionsFromIntersection(ix: number, iy: number): Array<{ x: number; y: number }> {
    const candidates = [
        { x: ix - 1, y: iy },
        { x: ix + 1, y: iy },
        { x: ix, y: iy - 1 },
        { x: ix, y: iy + 1 },
    ];
    return candidates.filter(pos => isValidIntersectionPos(pos.x, pos.y));
}
