# Stories (type Instagram) – Plan d’implémentation

## Objectif
Afficher des stories (photo/vidéo courte) en haut du feed, avec une UI proche d’Instagram : vignettes rondes, modal plein écran avec progression, et CTA (recette, astuce, lien).

## Données / Backend
- Nouveau modèle `Story` : `id`, `owner_id`, `owner_username`, `media_url` (image/vidéo), `title` (court), `link` (recette/astuce), `expires_at` (optionnel), `created_at`.
- Endpoints :
  - `GET /stories` : stories publiques (et/ou des abonnements).
  - `POST /stories` : publier (non prioritaire pour la démo, on peut seed).
- Seed démo : 3-4 stories “CoachBot” (recette post-workout, routine mobilité, astuce récupération) avec images statiques ou GIF/vidéo légère.

## Frontend (app)
- Carrousel horizontal en haut du feed :
  - Vignettes rondes avec bordure accent si non vues.
  - Titre/username sous la vignette.
  - Tap → ouvre la story en plein écran.
- Modal story :
  - Progress bar en haut (x segments si multi slides).
  - Tap droite = slide suivante, tap gauche = précédente, swipe down pour fermer.
  - Contenu : image/vidéo, titre court, bouton “Voir la recette / l’astuce” (ouvre le lien).
  - Thème aligné (clair/sombre).

## Persist/UX
- Marquer une story comme vue en local (store simple) pour enlever le highlight.
- Expiration : côté démo, on ignore ou on filtre sur `expires_at`.

## Étapes
1) Back : modèle + endpoint GET, seed stories CoachBot.
2) Front : composant `StoriesCarousel` (data mock -> API).
3) Modal story avec progression et CTA.
4) Intégration feed : section en haut (scroll horizontal), fallback “aucune story”.
5) Tests : navigation UI, ouverture lien, thème.

## Notes
- Si pas de backend pour le post, on laisse en seed + GET seulement.
- Media : commencer par images statiques hébergées (ou bundlées), vidéo légère si réseau OK. 
