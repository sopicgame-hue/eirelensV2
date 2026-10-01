/**
 * Accès global à l'instance de Game pour les composants React.
 * (Une seule partie existe à la fois ; pas besoin de Context React.)
 */
import type { Game } from '../core/Game';

let current: Game | null = null;

export function setGame(g: Game | null) {
  current = g;
}

export function getGame(): Game | null {
  return current;
}
