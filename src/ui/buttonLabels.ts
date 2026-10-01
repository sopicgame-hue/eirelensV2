/**
 * Libellés des boutons selon le périphérique utilisé (affichés dans l'UI).
 */
import type { Action } from '../input/bindings';

type Device = 'keyboard' | 'gamepad' | 'touch';

const LABELS: Record<Device, Partial<Record<Action, string>>> = {
  gamepad: { confirm: 'A', back: 'B', run: 'B', photo: 'Y', shutter: 'A', vehicle: 'X', map: 'Select', album: '↓', pause: 'Start', call: '↑', tabLeft: 'LB', tabRight: 'RB' },
  keyboard: { confirm: 'Espace', back: 'Échap', run: 'Maj', photo: 'C', shutter: 'Espace', vehicle: 'V', map: 'M', album: 'B', pause: 'Échap', call: 'R', tabLeft: 'A', tabRight: 'E' },
  touch: { confirm: 'A', back: '✕', run: '🐑', photo: '📷', shutter: '📷', vehicle: '🚲', map: '🗺', album: '📖', pause: '☰', call: '🔔', tabLeft: '◀', tabRight: '▶' },
};

export function btn(device: Device, action: Action) {
  return LABELS[device][action] ?? action;
}
