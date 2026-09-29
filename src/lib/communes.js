/* Communes de la zone d'intervention (CACL) et leur centre approximatif,
   utilisé quand un signalement n'a ni position GPS ni adresse localisable. */
export const COMMUNES = [
  { nom: 'Cayenne',                lat: 4.9372, lng: -52.3260 },
  { nom: 'Rémire-Montjoly',        lat: 4.9050, lng: -52.2767 },
  { nom: 'Matoury',                lat: 4.8472, lng: -52.3311 },
  { nom: 'Macouria',               lat: 5.0139, lng: -52.4742 },
  { nom: 'Montsinéry-Tonnegrande', lat: 4.8919, lng: -52.4933 },
  { nom: 'Roura',                  lat: 4.7280, lng: -52.3260 }
];

export function communeCenter(nom){
  return COMMUNES.find((c) => c.nom === nom) || { nom, lat: 4.925, lng: -52.38 };
}
