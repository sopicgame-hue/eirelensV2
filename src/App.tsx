import { GameView } from './ui/GameView';
import { AtelierView } from './atelier/AtelierView';
import { isAtelierMode } from './atelier/catalog';

/** ?atelier dans l'URL → atelier 3D (outil de création), sinon le jeu. */
export default function App() {
  return <main className="h-[100dvh] w-screen overflow-hidden bg-black">{isAtelierMode() ? <AtelierView /> : <GameView />}</main>;
}
