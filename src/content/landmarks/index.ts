/**
 * REGISTRE DES MONUMENTS — la liste de tous les lieux à photographier.
 * Pour ajouter un monument : crée son fichier, puis ajoute-le dans LANDMARKS.
 *
 * La ZONE d'un lieu est déduite de ses coordonnées (world/data/zones.ts) et son
 * importance de son champ `tier`. L'album trie par zone puis par importance ;
 * l'ordre ci-dessous ne sert qu'à départager.
 *
 * Origine : "liste" = liste de départ de Yann (obligatoire) ;
 *           "proposition" = ajouté par le game designer (peut être retiré).
 */
import { LandmarkDef } from './types';
// --- Le Sud
import { fungieDingle } from './fungie_dingle'; // liste ☆
import { rockOfCashel } from './rock_of_cashel'; // liste ☆
import { kingJohnsCastle } from './king_johns_castle'; // liste ◉
import { rossCastle } from './ross_castle'; // liste ◉
import { kilkennyCastle } from './kilkenny_castle'; // liste ◉
import { torcWaterfall } from './torc_waterfall'; // liste ♥
import { blarneyCastle } from './blarney_castle'; // proposition
import { gapOfDunloe } from './gap_of_dunloe'; // proposition
import { skelligMichael } from './skellig_michael'; // proposition
import { fastnet } from './fastnet'; // proposition
import { mizenHead } from './mizen_head'; // proposition
import { carrauntoohil } from './carrauntoohil'; // proposition
import { hookHead } from './hook_head'; // proposition
// --- L'Irlande du Nord
import { titanicBelfast } from './titanic_belfast'; // liste ☆
import { giantsCauseway } from './giants_causeway'; // liste ☆
import { cranfieldChurch } from './cranfield_church'; // liste ◉
import { peaceBridge } from './peace_bridge'; // liste ◉
import { essNaCrub } from './ess_na_crub'; // liste ♥
import { dunluceCastle } from './dunluce_castle'; // proposition
import { carrickARede } from './carrick_a_rede'; // proposition
import { darkHedges } from './dark_hedges'; // proposition
import { mussendenTemple } from './mussenden_temple'; // proposition
// --- L'Ouest et le Nord-Ouest
import { wormholeAran } from './wormhole_aran'; // liste ☆
import { clonmacnoise } from './clonmacnoise'; // liste ☆ (église des Nonnes)
import { cliffsOfMoher } from './cliffs_of_moher'; // liste ☆
import { connemara } from './connemara'; // liste ☆
import { glenveagh } from './glenveagh'; // liste ☆
import { nimmosPier } from './nimmos_pier'; // liste ◉
import { loughConn } from './lough_conn'; // liste ◉
import { slieveLeague } from './slieve_league'; // liste ♥
import { poulnabrone } from './poulnabrone'; // proposition
import { dunAonghasa } from './dun_aonghasa'; // proposition
import { kylemoreAbbey } from './kylemore_abbey'; // proposition
import { croaghPatrick } from './croagh_patrick'; // proposition
import { benbulbin } from './benbulbin'; // proposition
import { bunrattyCastle } from './bunratty_castle'; // proposition
import { dunguaireCastle } from './dunguaire_castle'; // proposition
import { ashfordCastle } from './ashford_castle'; // proposition
import { errigal } from './errigal'; // proposition
import { malinHead } from './malin_head'; // proposition
import { fanadHead } from './fanad_head'; // proposition
// --- Dublin et ses environs
import { newgrange } from './newgrange'; // liste ☆
import { howthBaily } from './howth_baily'; // liste ☆
import { glendalough } from './glendalough'; // liste ☆ (site + lac)
import { minersVillage } from './miners_village'; // liste ◉
import { loughanleagh } from './loughanleagh'; // liste ◉
import { powerscourtWaterfall } from './powerscourt_waterfall'; // liste ♥
import { templeBar } from './temple_bar'; // proposition
import { hillOfTara } from './hill_of_tara'; // proposition

export const LANDMARKS: LandmarkDef[] = [
  // Le Sud
  fungieDingle,
  rockOfCashel,
  kingJohnsCastle,
  rossCastle,
  kilkennyCastle,
  torcWaterfall,
  blarneyCastle,
  gapOfDunloe,
  skelligMichael,
  fastnet,
  mizenHead,
  carrauntoohil,
  hookHead,
  // L'Irlande du Nord
  titanicBelfast,
  giantsCauseway,
  cranfieldChurch,
  peaceBridge,
  essNaCrub,
  dunluceCastle,
  carrickARede,
  darkHedges,
  mussendenTemple,
  // L'Ouest et le Nord-Ouest
  wormholeAran,
  clonmacnoise,
  cliffsOfMoher,
  connemara,
  glenveagh,
  nimmosPier,
  loughConn,
  slieveLeague,
  poulnabrone,
  dunAonghasa,
  kylemoreAbbey,
  croaghPatrick,
  benbulbin,
  bunrattyCastle,
  dunguaireCastle,
  ashfordCastle,
  errigal,
  malinHead,
  fanadHead,
  // Dublin et ses environs
  newgrange,
  howthBaily,
  glendalough,
  minersVillage,
  loughanleagh,
  powerscourtWaterfall,
  templeBar,
  hillOfTara,
];
