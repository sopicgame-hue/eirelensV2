/**
 * ROUTES (données éditables)
 * ---------------------------------------------------------------------------
 * Une route = une liste d'étapes. Une étape est soit le NOM EXACT d'une ville
 * de towns.ts, soit un point { lat, lon } (pour contourner un lac, une baie…).
 * Le moteur trace la route en ligne droite entre les étapes, aplanit le terrain
 * dessous et crée automatiquement une chaussée quand elle traverse un lac ou
 * une rivière. ATTENTION : une route ne doit pas traverser la MER (baie, estuaire) :
 * ajoute des points intermédiaires pour longer la côte. Le test de démarrage
 * affiche un avertissement dans la console si c'est le cas.
 */

export type RouteStep = string | { lat: number; lon: number };

export interface Route {
  name: string;
  steps: RouteStep[];
}

export const ROUTES: Route[] = [
  { name: 'M1 Dublin – Belfast', steps: ['Dublin', 'Drogheda', 'Dundalk', 'Newry', 'Lisburn', 'Belfast'] },
  { name: 'M4/M6 Dublin – Galway', steps: ['Dublin', { lat: 53.454, lon: -7.101 }, 'Mullingar', 'Athlone', 'Ballinasloe', 'Galway'] },
  { name: 'M7 Dublin – Limerick', steps: ['Dublin', 'Naas', 'Portlaoise', 'Nenagh', 'Limerick'] },
  { name: 'M8 Portlaoise – Cork', steps: ['Portlaoise', 'Cashel', 'Mitchelstown', 'Cork'] },
  { name: 'M9 Naas – Waterford', steps: ['Naas', 'Carlow', 'Kilkenny', 'Waterford'] },
  { name: 'N11 Dublin – Wexford', steps: ['Dublin', 'Wicklow', 'Arklow', 'Wexford'] },
  { name: 'N25 Cork – Wexford', steps: ['Cork', 'Youghal', 'Dungarvan', 'Waterford', 'New Ross', 'Wexford'] },
  { name: 'N21 Limerick – Tralee', steps: ['Limerick', { lat: 52.565, lon: -8.79 }, { lat: 52.385, lon: -9.3 }, 'Tralee'] },
  { name: 'N22 Cork – Tralee', steps: ['Cork', 'Macroom', 'Killarney', 'Tralee'] },
  {
    name: 'Ring of Kerry',
    steps: ['Killarney', 'Kenmare', { lat: 51.885, lon: -9.7 }, { lat: 51.837, lon: -9.898 }, { lat: 51.826, lon: -10.17 }, 'Cahersiveen', { lat: 52.057, lon: -9.94 }, { lat: 52.106, lon: -9.785 }, 'Killarney'],
  },
  { name: 'Route de Portmagee', steps: ['Cahersiveen', { lat: 51.915, lon: -10.25 }, { lat: 51.895, lon: -10.31 }, 'Portmagee'] },
  { name: 'Péninsule de Dingle', steps: ['Tralee', { lat: 52.235, lon: -9.74 }, { lat: 52.212, lon: -9.84 }, { lat: 52.15, lon: -10.057 }, 'Dingle'] },
  { name: 'West Cork', steps: ['Cork', { lat: 51.746, lon: -8.742 }, 'Clonakilty', 'Skibbereen', 'Bantry', { lat: 51.716, lon: -9.44 }, { lat: 51.75, lon: -9.545 }, 'Kenmare'] },
  { name: 'Route de Schull', steps: ['Skibbereen', { lat: 51.572, lon: -9.4 }, { lat: 51.566, lon: -9.462 }, 'Schull'] },
  { name: 'Route de Kinsale', steps: ['Cork', 'Kinsale'] },
  {
    name: 'Wild Atlantic Way (Clare)',
    steps: ['Limerick', 'Ennis', 'Lahinch', 'Doolin', { lat: 53.095, lon: -9.15 }, 'Kinvara', { lat: 53.228, lon: -8.876 }, { lat: 53.268, lon: -8.925 }, { lat: 53.292, lon: -8.96 }, { lat: 53.29, lon: -9.02 }, 'Galway'],
  },
  {
    name: 'Wild Atlantic Way (Connemara)',
    steps: ['Galway', { lat: 53.42, lon: -9.32 }, { lat: 53.46, lon: -9.54 }, 'Clifden', { lat: 53.552, lon: -9.948 }, 'Leenaun', 'Westport'],
  },
  { name: 'Route de Cong', steps: [{ lat: 53.42, lon: -9.32 }, 'Cong', 'Castlebar'] },
  {
    name: 'Wild Atlantic Way (Mayo – Sligo – Donegal)',
    steps: ['Westport', 'Castlebar', 'Ballina', { lat: 54.18, lon: -8.6 }, { lat: 54.19, lon: -8.5 }, 'Sligo', { lat: 54.478, lon: -8.281 }, { lat: 54.503, lon: -8.189 }, { lat: 54.6, lon: -8.1 }, 'Donegal', 'Letterkenny', 'Derry'],
  },
  { name: 'Route de Glencolumbkille', steps: ['Donegal', { lat: 54.66, lon: -8.45 }, 'Glencolumbkille'] },
  { name: 'Route de Dunfanaghy', steps: ['Letterkenny', 'Dunfanaghy'] },
  { name: 'N17 Galway – Sligo', steps: ['Galway', 'Tuam', { lat: 53.72, lon: -8.99 }, { lat: 54.056, lon: -8.729 }, { lat: 54.187, lon: -8.49 }, 'Sligo'] },
  { name: 'N4 Dublin – Sligo', steps: ['Mullingar', 'Longford', 'Carrick-on-Shannon', 'Boyle', { lat: 54.187, lon: -8.49 }] },
  { name: 'N5 Longford – Castlebar', steps: ['Longford', { lat: 53.775, lon: -8.103 }, { lat: 53.87, lon: -8.41 }, { lat: 53.94, lon: -8.95 }, 'Castlebar'] },
  { name: 'N61 Athlone – Roscommon – Boyle', steps: ['Athlone', 'Roscommon', 'Boyle'] },
  { name: 'Belfast – Derry', steps: ['Belfast', { lat: 54.715, lon: -6.21 }, 'Ballymena', 'Coleraine', { lat: 55.05, lon: -6.95 }, 'Derry'] },
  { name: 'Causeway Coastal Route', steps: ['Larne', { lat: 54.97, lon: -5.97 }, { lat: 55.08, lon: -6.07 }, 'Ballycastle', 'Bushmills', 'Coleraine'] },
  { name: 'Belfast – Larne', steps: ['Belfast', { lat: 54.65, lon: -5.97 }, { lat: 54.705, lon: -5.93 }, { lat: 54.76, lon: -5.84 }, 'Larne'] },
  { name: 'Belfast – Downpatrick – Newcastle', steps: ['Belfast', 'Downpatrick', 'Newcastle', 'Newry'] },
  { name: 'Belfast – Enniskillen – Sligo', steps: ['Lisburn', 'Dungannon', 'Enniskillen', { lat: 54.29, lon: -7.88 }, { lat: 54.3, lon: -8.17 }, 'Sligo'] },
  { name: 'Derry – Enniskillen', steps: ['Derry', 'Strabane', 'Omagh', 'Enniskillen'] },
  { name: 'N3 Dublin – Cavan', steps: ['Dublin', 'Navan', 'Cavan', 'Enniskillen'] },
  { name: 'Newry – Armagh – Cavan', steps: ['Newry', 'Armagh', 'Monaghan', 'Cavan'] },
  { name: 'Tullamore', steps: ['Athlone', 'Tullamore', 'Portlaoise'] },
  { name: 'Clonmel', steps: ['Cashel', 'Clonmel', 'Waterford'] },
  { name: 'Mallow', steps: ['Mitchelstown', 'Mallow', 'Killarney'] },
  { name: 'Glendalough', steps: ['Wicklow', 'Glendalough'] },
];
