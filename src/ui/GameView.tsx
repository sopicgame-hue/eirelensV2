/**
 * GameView — monte le canvas, crée l'instance Game, et affiche l'écran
 * d'interface correspondant à uiStore.screen.
 *
 * Pour ajouter un écran : ajoute son nom dans le type Screen (uiStore.ts),
 * crée le composant dans ui/screens/, puis ajoute une ligne dans SCREENS.
 */
import React, { useEffect, useRef } from 'react';
import { Game } from '../core/Game';
import { setGame } from './gameRef';
import { useUi, uiStore, Screen } from './uiStore';
import { Hud } from './Hud';
import { PhotoOverlay, LastPhotoCard } from './PhotoOverlay';
import { LoadingScreen, TitleScreen } from './screens/TitleScreen';
import { PauseMenu } from './screens/PauseMenu';
import { VehicleMenu } from './screens/VehicleMenu';
import { CustomizeScreen } from './screens/CustomizeScreen';
import { AlbumScreen } from './screens/AlbumScreen';
import { MapScreen } from './screens/MapScreen';
import { TrainScreen, TravelScreen } from './screens/TrainScreen';
import { TouchControls } from './TouchControls';

const SCREENS: Record<Screen, React.FC | null> = {
  loading: LoadingScreen,
  title: TitleScreen,
  play: Hud,
  photo: PhotoOverlay,
  album: AlbumScreen,
  map: MapScreen,
  pause: PauseMenu,
  customize: CustomizeScreen,
  vehicles: VehicleMenu,
  train: TrainScreen,
  travel: TravelScreen,
};

export function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screen = useUi((s) => s.screen);

  useEffect(() => {
    const game = new Game(canvasRef.current!);
    setGame(game);
    game.load().catch((e) => {
      console.error('[EireLens] échec du chargement', e);
      alert('Erreur au chargement du jeu : ' + (e?.message ?? e));
    });
    // Pratique pour déboguer dans la console du navigateur : __eirelens.player.pos, etc.
    (window as any).__eirelens = game;
    (window as any).__eirelensUi = uiStore;
    return () => {
      game.dispose();
      setGame(null);
    };
  }, []);

  const ScreenComp = SCREENS[screen];
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1f3a2b] font-[Nunito,system-ui,sans-serif]" onPointerDown={() => (window as any).__eirelens?.unlockAudio?.()}>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full touch-none" />
      {ScreenComp && <ScreenComp key={screen} />}
      {(screen === 'play' || screen === 'photo') && <TouchControls />}
      {screen === 'play' && <LastPhotoCard />}
    </div>
  );
}
