/**
 * City Chase - Main App Component
 */

import { GameContext, useGameProvider } from "./logic/gameState";
import { SetupPhase } from "./components/SetupPhase";
import { GameStatus } from "./components/GameStatus";
import { CriminalAction } from "./components/CriminalAction";
import { PoliceAction } from "./components/PoliceAction";
import { TurnTransition } from "./components/TurnTransition";
import "./App.css";

function App() {
  const gameContext = useGameProvider();
  const { state } = gameContext;

  return (
    <GameContext.Provider value={gameContext}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6">
        {/* ヘッダー */}
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            🏙️ City Chase
          </h1>
          <p className="text-gray-400">
            {state.phase === "setup_police_heli" && "警察がヘリを配置しています..."}
            {state.phase === "setup_criminal_building" && "容疑者が隠れる建物を選択しています..."}
            {state.phase === "playing" && `ラウンド ${state.round} / 11`}
            {state.phase === "gameover" && "ゲーム終了"}
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* セットアップフェーズ */}
          {(state.phase === "setup_police_heli" || state.phase === "setup_criminal_building") && (
            <SetupPhase state={state} context={gameContext} />
          )}

          {/* ゲーム進行フェーズ */}
          {state.phase === "playing" && (
            <div className="space-y-6">
              {state.isTurnTransition ? (
                <TurnTransition state={state} context={gameContext} />
              ) : (
                <>
                  <GameStatus state={state} context={gameContext} />

                  {state.currentPlayer === "criminal" && (
                    <CriminalAction state={state} context={gameContext} />
                  )}

                  {state.currentPlayer === "police" && (
                    <PoliceAction state={state} context={gameContext} />
                  )}
                </>
              )}
            </div>
          )}

          {/* ゲームオーバーフェーズ */}
          {state.phase === "gameover" && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <GameStatus state={state} context={gameContext} />

              <div className="mt-8">
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-lg"
                >
                  もう一度プレイ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2026 City Chase Game - Made with React & Canvas</p>
          <p className="mt-1">📱 スマートフォン対応 | 🖥️ デスクトップ対応</p>
        </footer>
      </div>
    </GameContext.Provider>
  );
}

export default App;
