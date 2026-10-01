/**
 * REGISTRE DES MONUMENTS — la liste de tous les lieux à photographier.
 * Pour ajouter un monument : crée son fichier, puis ajoute-le dans LANDMARKS.
 * L'ordre de cette liste = l'ordre de l'album (numérotation façon Pokédex).
 */
import { LandmarkDef } from './types';
import { giantsCauseway } from './giants_causeway';
import { cliffsOfMoher } from './cliffs_of_moher';
import { poulnabrone } from './poulnabrone';
import { rockOfCashel } from './rock_of_cashel';
import { fastnet } from './fastnet';
import { darkHedges } from './dark_hedges';
import { glendalough } from './glendalough';
import { newgrange } from './newgrange';
import { skelligMichael } from './skellig_michael';
import { dunluceCastle } from './dunluce_castle';
import { kylemoreAbbey } from './kylemore_abbey';
import { croaghPatrick } from './croagh_patrick';
import { benbulbin } from './benbulbin';
import { slieveLeague } from './slieve_league';
import { carrickARede } from './carrick_a_rede';
import { blarneyCastle } from './blarney_castle';
import { kilkennyCastle } from './kilkenny_castle';
import { bunrattyCastle } from './bunratty_castle';
import { dunAonghasa } from './dun_aonghasa';
import { rossCastle } from './ross_castle';
import { gapOfDunloe } from './gap_of_dunloe';
import { clonmacnoise } from './clonmacnoise';
import { hookHead } from './hook_head';
import { mizenHead } from './mizen_head';
import { malinHead } from './malin_head';
import { errigal } from './errigal';
import { templeBar } from './temple_bar';
import { titanicBelfast } from './titanic_belfast';
import { dunguaireCastle } from './dunguaire_castle';
import { hillOfTara } from './hill_of_tara';
import { ashfordCastle } from './ashford_castle';
import { mussendenTemple } from './mussenden_temple';
import { carrauntoohil } from './carrauntoohil';
import { fanadHead } from './fanad_head';

export const LANDMARKS: LandmarkDef[] = [
  giantsCauseway,
  cliffsOfMoher,
  poulnabrone,
  rockOfCashel,
  fastnet,
  darkHedges,
  glendalough,
  newgrange,
  skelligMichael,
  dunluceCastle,
  kylemoreAbbey,
  croaghPatrick,
  benbulbin,
  slieveLeague,
  carrickARede,
  blarneyCastle,
  kilkennyCastle,
  bunrattyCastle,
  dunAonghasa,
  rossCastle,
  gapOfDunloe,
  clonmacnoise,
  hookHead,
  mizenHead,
  malinHead,
  errigal,
  templeBar,
  titanicBelfast,
  dunguaireCastle,
  hillOfTara,
  ashfordCastle,
  mussendenTemple,
  carrauntoohil,
  fanadHead,
];
