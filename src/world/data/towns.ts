/**
 * VILLES ET VILLAGES (données éditables)
 * ---------------------------------------------------------------------------
 * Chaque ville génère automatiquement un petit groupe de maisons colorées
 * (style façades irlandaises). Les routes (roads.ts) peuvent référencer une
 * ville par son nom exact.
 *
 * size : 0 = hameau (4-6 maisons), 1 = village, 2 = ville, 3 = grande ville.
 * Pour AJOUTER une ville : une ligne, coordonnées Google Maps (lat, lon).
 */

export interface Town {
  name: string;
  lat: number;
  lon: number;
  size: 0 | 1 | 2 | 3;
}

export const TOWNS: Town[] = [
  // Grandes villes
  // Centre placé au nord de la Liffey (O'Connell Street) : les routes partent d'ici, et une
  // route "assèche" l'eau autour d'elle — au ras du fleuve, elles l'auraient comblé.
  { name: 'Dublin', lat: 53.356, lon: -6.262, size: 3 },
  { name: 'Belfast', lat: 54.597, lon: -5.93, size: 3 },
  { name: 'Cork', lat: 51.898, lon: -8.471, size: 3 },
  // Villes
  { name: 'Galway', lat: 53.271, lon: -9.049, size: 2 },
  { name: 'Limerick', lat: 52.664, lon: -8.624, size: 2 },
  { name: 'Derry', lat: 54.997, lon: -7.309, size: 2 },
  { name: 'Waterford', lat: 52.259, lon: -7.11, size: 2 },
  { name: 'Kilkenny', lat: 52.654, lon: -7.252, size: 2 },
  { name: 'Sligo', lat: 54.277, lon: -8.475, size: 2 },
  { name: 'Athlone', lat: 53.423, lon: -7.94, size: 2 },
  { name: 'Killarney', lat: 52.059, lon: -9.507, size: 2 },
  { name: 'Tralee', lat: 52.271, lon: -9.7, size: 2 },
  // Villages
  { name: 'Westport', lat: 53.8, lon: -9.522, size: 1 },
  { name: 'Clifden', lat: 53.489, lon: -10.019, size: 1 },
  { name: 'Dingle', lat: 52.141, lon: -10.268, size: 1 },
  { name: 'Kenmare', lat: 51.88, lon: -9.584, size: 1 },
  { name: 'Ennis', lat: 52.843, lon: -8.986, size: 1 },
  { name: 'Doolin', lat: 53.017, lon: -9.377, size: 0 },
  { name: 'Donegal', lat: 54.654, lon: -8.11, size: 1 },
  { name: 'Letterkenny', lat: 54.95, lon: -7.734, size: 1 },
  { name: 'Enniskillen', lat: 54.344, lon: -7.64, size: 1 },
  { name: 'Armagh', lat: 54.35, lon: -6.653, size: 1 },
  { name: 'Newry', lat: 54.176, lon: -6.349, size: 1 },
  { name: 'Dundalk', lat: 54.0, lon: -6.405, size: 1 },
  { name: 'Drogheda', lat: 53.718, lon: -6.348, size: 1 },
  { name: 'Wexford', lat: 52.336, lon: -6.463, size: 1 },
  { name: 'Wicklow', lat: 52.98, lon: -6.044, size: 1 },
  { name: 'Carlow', lat: 52.837, lon: -6.934, size: 1 },
  { name: 'Cashel', lat: 52.516, lon: -7.886, size: 1 },
  { name: 'Clonmel', lat: 52.355, lon: -7.704, size: 1 },
  { name: 'Mallow', lat: 52.134, lon: -8.645, size: 1 },
  { name: 'Kinsale', lat: 51.706, lon: -8.522, size: 1 },
  { name: 'Skibbereen', lat: 51.551, lon: -9.263, size: 1 },
  { name: 'Bantry', lat: 51.68, lon: -9.453, size: 1 },
  { name: 'Castlebar', lat: 53.855, lon: -9.298, size: 1 },
  { name: 'Ballina', lat: 54.115, lon: -9.155, size: 1 },
  { name: 'Carrick-on-Shannon', lat: 53.947, lon: -8.09, size: 1 },
  { name: 'Mullingar', lat: 53.525, lon: -7.338, size: 1 },
  { name: 'Tullamore', lat: 53.274, lon: -7.493, size: 1 },
  { name: 'Portlaoise', lat: 53.034, lon: -7.299, size: 1 },
  { name: 'Navan', lat: 53.653, lon: -6.681, size: 1 },
  { name: 'Cavan', lat: 53.99, lon: -7.36, size: 1 },
  { name: 'Monaghan', lat: 54.249, lon: -6.968, size: 1 },
  { name: 'Omagh', lat: 54.6, lon: -7.3, size: 1 },
  { name: 'Coleraine', lat: 55.133, lon: -6.668, size: 1 },
  { name: 'Ballycastle', lat: 55.204, lon: -6.241, size: 1 },
  { name: 'Ballymena', lat: 54.864, lon: -6.276, size: 1 },
  { name: 'Larne', lat: 54.858, lon: -5.823, size: 1 },
  { name: 'Roscommon', lat: 53.632, lon: -8.19, size: 1 },
  { name: 'Longford', lat: 53.727, lon: -7.799, size: 1 },
  { name: 'Nenagh', lat: 52.862, lon: -8.197, size: 1 },
  { name: 'Dungarvan', lat: 52.088, lon: -7.625, size: 1 },
  { name: 'Youghal', lat: 51.954, lon: -7.851, size: 1 },
  { name: 'Arklow', lat: 52.797, lon: -6.16, size: 1 },
  { name: 'Downpatrick', lat: 54.328, lon: -5.716, size: 1 },
  { name: 'Strabane', lat: 54.827, lon: -7.463, size: 1 },
  { name: 'Tuam', lat: 53.515, lon: -8.851, size: 1 },
  { name: 'Ballinasloe', lat: 53.328, lon: -8.224, size: 1 },
  { name: 'Macroom', lat: 51.904, lon: -8.957, size: 1 },
  { name: 'Clonakilty', lat: 51.623, lon: -8.886, size: 1 },
  { name: 'Lisburn', lat: 54.51, lon: -6.04, size: 1 },
  { name: 'Dungannon', lat: 54.503, lon: -6.767, size: 1 },
  { name: 'Naas', lat: 53.216, lon: -6.666, size: 1 },
  { name: 'New Ross', lat: 52.396, lon: -6.936, size: 1 },
  { name: 'Mitchelstown', lat: 52.266, lon: -8.268, size: 0 },
  { name: 'Boyle', lat: 53.973, lon: -8.3, size: 0 },
  // Hameaux (points d'intérêt, ports d'embarquement…)
  { name: 'Bushmills', lat: 55.204, lon: -6.522, size: 0 },
  { name: 'Kinvara', lat: 53.14, lon: -8.935, size: 0 },
  { name: 'Lahinch', lat: 52.933, lon: -9.344, size: 0 },
  { name: 'Portmagee', lat: 51.885, lon: -10.362, size: 0 },
  { name: 'Cahersiveen', lat: 51.948, lon: -10.222, size: 0 },
  { name: 'Schull', lat: 51.526, lon: -9.546, size: 0 },
  { name: 'Leenaun', lat: 53.596, lon: -9.693, size: 0 },
  { name: 'Cong', lat: 53.54, lon: -9.285, size: 0 },
  { name: 'Dunfanaghy', lat: 55.183, lon: -7.969, size: 0 },
  { name: 'Glencolumbkille', lat: 54.709, lon: -8.725, size: 0 },
  { name: 'Newcastle', lat: 54.218, lon: -5.889, size: 0 },
  { name: 'Glendalough', lat: 53.011, lon: -6.327, size: 0 },
];
