/**
 * Plein écran (y compris Safari iPad, préfixe webkit).
 * Sur iPad, la meilleure expérience reste : Safari → Partager → "Sur l'écran
 * d'accueil" (le manifest lance alors le jeu en plein écran, sans barre).
 */
export function toggleFullscreen() {
  const doc = document as any;
  const el = document.documentElement as any;
  const isFs = doc.fullscreenElement || doc.webkitFullscreenElement;
  try {
    if (isFs) (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
    else (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  } catch (e) {
    console.warn('[fullscreen] non supporté ici', e);
  }
}
