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
  | 'unlock'
  | 'horse'
  | 'takeoff'
  | 'zoneLocked'
  | 'zoneOpen'
  | 'train'
  | 'money';

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
  unlock: ['Un nouveau moyen de transport ? Avec un siège pour moi j’espère.', 'Tu as acheté ça avec NOS pièces ? Bon. D’accord.'],
  horse: ['Un cheval ? Je me sens remplacé.', 'Je voyage sur la croupe. Comme un roi. Un roi un peu secoué.', 'Il sent le foin. J’aime bien.'],
  takeoff: ['BÊÊÊÊÊÊÊÊ !', 'Je ne regarde pas en bas. Je ne regarde pas en bas.', 'Les moutons volants, c’est pas une expression, ça ?', 'Le harnais est solide ? Dis-moi qu’il est solide.'],
  zoneLocked: ['C’est fermé. Même pour un mouton.', 'Il nous faut d’abord finir l’album d’ici.', 'Zone verrouillée… Il reste des photos à prendre par ici.'],
  zoneOpen: ['Une nouvelle région ! On prend le train ?', 'J’ai toujours rêvé de voir du pays. Enfin, d’autres prés.', 'Tchou-tchou ! Direction la gare !'],
  train: ['Le train, c’est le seul véhicule où je ne fais rien. J’adore.', 'Tchou-tchou ! On est arrivés ?', 'Ça sent l’herbe nouvelle par ici.'],
  money: ['Ça paie, la photo !', 'Des pièces ! On s’achète un champ ?', 'Je garde la caisse, si tu veux.'],
};

export function sheepLine(trigger: SheepTrigger, name: string) {
  const list = SHEEP_LINES[trigger];
  return list[Math.floor(Math.random() * list.length)].replace('{name}', name);
}
