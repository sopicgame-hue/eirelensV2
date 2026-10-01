/**
 * RÉPLIQUES DU MOUTON (données éditables) — le ressort comique du jeu.
 * Chaque clé = une situation. Une réplique est tirée au hasard dans la liste.
 * {name} est remplacé par le nom du mouton.
 * Ton : pince-sans-rire, un peu râleur mais attachant. Phrases COURTES.
 */
export type SheepTrigger =
  | 'idle'
  | 'pet'
  | 'call'
  | 'rideStart'
  | 'rideLong'
  | 'vehicle'
  | 'boat'
  | 'photoGreat'
  | 'photoMeh'
  | 'photoNothing'
  | 'photobomb'
  | 'discover'
  | 'night'
  | 'teleport'
  | 'unlock';

export const SHEEP_LINES: Record<SheepTrigger, string[]> = {
  idle: [
    'Bêê. (Traduction : on marche ou on prend racine ?)',
    'Cette herbe a un goût de… Galway.',
    'Si tu cherches un monument, j’en vois un. C’est moi.',
    'Tu as pensé à prendre un parapluie ? Non ? Moi non plus.',
    'Quarante nuances de vert, et je les ai toutes goûtées.',
    'Je ne suis pas paresseux, je suis contemplatif.',
  ],
  pet: ['Bêêê ♥', 'Encore. À gauche. Voilà.', 'Ma laine est 100 % irlandaise, tu sais.', 'Ok, tu peux continuer pendant une heure.'],
  call: ['J’arrive, j’arrive !', 'Bêê ? Ah, c’est toi.', 'Présent !'],
  rideStart: ['Hé ! Je ne suis pas un poney !', 'Accroche-toi à la laine !', 'Galop de mouton activé. BÊÊÊ !'],
  rideLong: ['Mes pattes… ne sentent plus… l’herbe…', 'On fait une pause ? Une petite ?', 'Tu me dois un champ entier de trèfle.'],
  vehicle: ['Enfin un peu de confort.', 'Ceinture attachée. Enfin… laine attachée.', 'Je conduis la prochaine fois.'],
  boat: ['Je ne sais pas nager. Je te le dis, au cas où.', 'Les moutons ne sont pas faits pour la mer. Pour info.', 'Si on coule, je flotte. Merci la laine.'],
  photoGreat: ['Magnifique. Presque aussi photogénique que moi.', 'Celle-là, on l’encadre !', 'Wow. Même moi je suis ému.'],
  photoMeh: ['Euh… c’est flou, non ?', 'Approche-toi un peu, peut-être ?', 'On voit surtout du ciel, là.'],
  photoNothing: ['Joli… brin d’herbe ?', 'Tu photographies quoi exactement ?', 'Il n’y a rien ici. À part moi.'],
  photobomb: ['Coucou !', 'Pardon, je passais.', 'Tu ne m’en voudras pas ?'],
  discover: ['Oh ! On en a trouvé un nouveau !', 'Un de plus pour l’album !', 'Ça, c’est de l’Irlande !'],
  night: ['Il fait nuit. Les moutons normaux dorment, tu sais.', 'Je compte les humains pour m’endormir.'],
  teleport: ['Me revoilà ! Raccourci secret.', 'Tu m’as semé ? Raté.', 'J’ai pris un autre chemin.'],
  unlock: ['Un nouveau moyen de transport ? Avec un siège pour moi j’espère.'],
};

export function sheepLine(trigger: SheepTrigger, name: string) {
  const list = SHEEP_LINES[trigger];
  return list[Math.floor(Math.random() * list.length)].replace('{name}', name);
}
