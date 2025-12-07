# Plan de portage — Mode Sport & Programmes (V1 → V2)

Sources analysées (V1) :
- Front : `V1/apps/frontend-coach/app/seance-active.tsx` (journal de séries, timers, focus exo, guides). Écran focus : `/exercice-focus`.
- Backend : `V1/apps/backend-api` (`schemas/session.py`, sets, analytics, progression).

Fonctionnalités à reprendre :
1) **Suivi guidé en séance (Mode sport)**  
   - Journal des séries (poids, reps, RPE), marquage validé.  
   - Timers par exercice, rappels.  
   - Guides exos (objectif, points clés, vidéo).  
   - Focus exo (navigation intra-séance).  

2) **Progression / analytics**  
   - Volume/sets cumulés, progression hebdo, PRs.  
   - Sync avec backend (Session, Set, SessionProgress).

3) **Programme généré** (plus tard/LLM)  
   - Questionnaire → génération de micro-cycles.  
   - Stockage Programme → Sessions → Sets.

Back-end à ajouter (FastAPI V2) :
- Modèles & tables : Program, Session, WorkoutSet (lié programme/session), SessionStatus/Progress.  
- Endpoints : CRUD Program/Session, POST sets/logs, GET progression/analytics, sync queue.  
- Migrations Alembic + seeds minimales.  
- Tests API (pytest) : CRUD session/set, progression, analytics.

Front-end à ajouter (Expo V2) :
- Écran “Mode sport” (suivi guidé) inspiré de `seance-active.tsx` : liste exos, ajout/validation sets, timers, CTA focus.  
- Écran “Focus exo” minimal : rappel points clés + timers + navigation suivant/précédent.  
- Intégration guides exos (objectif/points/vidéo) depuis catalogue ou fallback YouTube search.

Étapes concrètes (proposées) :
1. Back-end : définir schéma Program/Session/Set (FastAPI V2) + migrations Alembic + endpoints CRUD + tests.
2. Front-end : nouveau screen “mode-sport” (sans LLM) branché sur le store actuel (local) + API hooks (sync quand backend sera prêt).
3. Ajouter un focus exo léger (vue détaillée + validation rapide).
4. Analytics : exposer volume/sets/PR via API et afficher dans dashboard.
5. Génération de programme :
   - Route /programs/generate en place (placeholder utilisant les exos de la DB). À remplacer par le vrai `program-generator` V1 (split, objectif, équipements, blessures) pour générer un programme structuré.
   - Program/Session/Set sont stockés ; tests API ajoutés.
   - Côté front, ajouter un écran “Programme” consommant /programs et /programs/generate.
6. Programmes générés/LLM avancé : plus tard (questionnaire + génération LLM/IA).

Note : la partie LLM/coaching n’est pas urgente et sera intégrée après la base mode-sport + backend.
