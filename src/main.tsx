import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// IMPORTANT : pas de <StrictMode> ici. En développement, StrictMode monte les
// composants deux fois, ce qui créerait deux moteurs 3D (double chargement,
// double boucle de rendu). Ne pas le rajouter.
createRoot(document.getElementById('root')!).render(<App />);
