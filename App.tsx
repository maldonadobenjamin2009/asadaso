
import React, { useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { GameCanvas } from './components/GameCanvas';
import { Almanac } from './components/Almanac';
import { OptionsMenu } from './components/OptionsMenu';
import { SeedSelection } from './components/SeedSelection';
import { GameScreen, LevelType } from './types';
import { LanguageProvider } from './LanguageContext';

function AppContent() {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.MENU);
  const [currentLevel, setCurrentLevel] = useState<LevelType>(LevelType.DAY);
  const [selectedSeeds, setSelectedSeeds] = useState<string[]>([]);

  const handleLevelSelect = (level: LevelType) => {
    setCurrentLevel(level);
    setScreen(GameScreen.SEED_SELECTION);
  };

  const handleStartGame = (seeds: string[]) => {
    setSelectedSeeds(seeds);
    setScreen(GameScreen.GAME);
  };

  const renderScreen = () => {
    switch (screen) {
      case GameScreen.MENU:
        return (
          <MainMenu 
            onSelectLevel={handleLevelSelect}
            onNavigate={setScreen}
          />
        );
      case GameScreen.SEED_SELECTION:
        return (
          <SeedSelection 
            levelType={currentLevel}
            onStart={handleStartGame}
            onBack={() => setScreen(GameScreen.MENU)}
          />
        );
      case GameScreen.GAME:
        return (
          <GameCanvas 
            levelType={currentLevel}
            seedIds={selectedSeeds}
            onExit={() => setScreen(GameScreen.MENU)}
          />
        );
      case GameScreen.ALMANAC_PLANTS:
        return <Almanac mode="PLANTS" onBack={() => setScreen(GameScreen.MENU)} />;
      case GameScreen.ALMANAC_ZOMBIES:
        return <Almanac mode="ZOMBIES" onBack={() => setScreen(GameScreen.MENU)} />;
      case GameScreen.OPTIONS:
        return <OptionsMenu onBack={() => setScreen(GameScreen.MENU)} />;
      default:
        return <div>Error</div>;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden font-sans select-none">
      {renderScreen()}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
