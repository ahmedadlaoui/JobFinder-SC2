# NgRx State Management Guide: Implementing "Add to Favorites"

## Table of Contents

1. [The Problem: Why State Management?](#1-the-problem-why-state-management)
2. [NgRx Architecture Overview](#2-ngrx-architecture-overview)
3. [The Full Data Flow Diagram](#3-the-full-data-flow-diagram)
4. [Step-by-Step Implementation](#4-step-by-step-implementation)
   - [Step 1: Install NgRx](#step-1-install-ngrx)
   - [Step 2: Define the State Shape](#step-2-define-the-state-shape)
   - [Step 3: Create Actions](#step-3-create-actions)
   - [Step 4: Create the Reducer](#step-4-create-the-reducer)
   - [Step 5: Create Effects](#step-5-create-effects)
   - [Step 6: Create Selectors](#step-6-create-selectors)
   - [Step 7: Register the Store](#step-7-register-the-store)
   - [Step 8: Use in Components](#step-8-use-in-components)
5. [Complete Flow Walkthrough](#5-complete-flow-walkthrough)
6. [Your Current Code vs NgRx Code](#6-your-current-code-vs-ngrx-code)
7. [Key Concepts Summary](#7-key-concepts-summary)

---

## 1. The Problem: Why State Management?

### What you currently have

In your `FavoritesComponent`, you manage state directly inside the component:

```typescript
// favorites.ts — current approach
export class FavoritesComponent implements OnInit {
  favorites = signal<Favorite[]>([]);  // State lives HERE in the component
  loading = signal(false);

  removeFavorite(id: number): void {
    // Component talks directly to the HTTP service
    this.favoriteService.removeFavorite(id).subscribe({
      next: () => {
        // Component manually updates its own state
        this.favorites.update((list) => list.filter((f) => f.id !== id));
      },
    });
  }
}
```

### The problems with this approach

| Problem | Example in your app |
|---|---|
| **State is local** | If `JobCardComponent` adds a favorite, `FavoritesComponent` doesn't know about it until it reloads |
| **State logic is mixed with UI logic** | `removeFavorite()` handles HTTP calls AND state updates AND error handling all inside the component |
| **Hard to share state** | If a header needs to show "3 saved", it has no way to access the favorites count without its own HTTP call |
| **No single source of truth** | Multiple components could hold their own stale copy of favorites |

### What NgRx gives you

NgRx creates a **single global store** — one JavaScript object that holds ALL your application state. Every component reads from and writes to this one source of truth.

---

## 2. NgRx Architecture Overview

NgRx has **5 core building blocks**. Think of them as an assembly line:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Component │───▶│  Action  │───▶│ Reducer  │───▶│  Store   │───▶│ Selector │──▶ Component
│(dispatches)   │(describes)│   │(updates) │    │(holds)   │    │(queries) │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                     ▲
                                     │
                                ┌──────────┐
                                │  Effect  │ (handles side effects like HTTP calls)
                                └──────────┘
```

| Building Block | Analogy | What it does |
|---|---|---|
| **Store** | A database for your UI | A single immutable object holding the entire app state |
| **Action** | An event / message | A plain object saying "something happened" (e.g., "user clicked add favorite") |
| **Reducer** | An event handler | A pure function that takes current state + action → returns new state |
| **Effect** | A worker / middleware | Listens for actions, performs side effects (HTTP calls), then dispatches new actions |
| **Selector** | A database query | A function that extracts and computes derived data from the store |

### Key Rule: Unidirectional Data Flow

Data flows in **ONE direction only**:

```
User clicks button
      ↓
Component dispatches ACTION
      ↓
REDUCER creates new state (for synchronous changes)
  — or —
EFFECT handles HTTP call, then dispatches a new action → REDUCER creates new state
      ↓
STORE is updated
      ↓
SELECTOR picks out the data the component needs
      ↓
Component re-renders with new data
```

**Components never modify state directly.** They can only dispatch actions.

---

## 3. The Full Data Flow Diagram

Here's the complete flow for "Add to Favorites" in your JobFinder app:

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            COMPONENT LAYER                             │
 │                                                                        │
 │  JobCardComponent                          FavoritesComponent          │
 │  ┌──────────────────────┐                  ┌───────────────────────┐   │
 │  │ User clicks ♡ button │                  │ Displays favorites    │   │
 │  │                      │                  │ from store.select()   │   │
 │  │ this.store.dispatch( │                  │                       │   │
 │  │   addFavorite({job}) │                  │ selectAllFavorites ──▶│───┤
 │  │ )                    │                  │ selectLoading ───────▶│   │
 │  └──────────┬───────────┘                  └───────────────────────┘   │
 │             │                                         ▲               │
 └─────────────┼─────────────────────────────────────────┼───────────────┘
               │ dispatch                                │ select
               ▼                                         │
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                              STORE (NgRx)                              │
 │                                                                        │
 │  ┌─────────────┐     ┌──────────────┐     ┌────────────────────────┐  │
 │  │   ACTIONS    │────▶│   REDUCER     │────▶│   STATE               │  │
 │  │              │     │              │     │   {                    │  │
 │  │ addFavorite  │     │ on(addFav)   │     │     favorites: [],     │  │
 │  │ addFavSucess │     │  → loading   │     │     loading: false,    │  │
 │  │ addFavFail   │     │              │     │     error: null        │  │
 │  │ loadFavorites│     │ on(addSucess)│     │   }                    │  │
 │  │ removeFav    │     │  → add item  │     │                        │  │
 │  └──────┬──────┘     └──────────────┘     └──────────┬─────────────┘  │
 │         │                                            │                │
 │         │                                    ┌───────┴──────────┐     │
 │         │                                    │    SELECTORS     │     │
 │         │                                    │ selectAll        │     │
 │         │                                    │ selectLoading    │     │
 │         │                                    │ selectIsFavorite │     │
 │         │                                    └──────────────────┘     │
 └─────────┼────────────────────────────────────────────────────────────┘
           │
           ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                             EFFECTS LAYER                              │
 │                                                                        │
 │  ┌────────────────────────────────────────────────────────────────┐    │
 │  │ Listens for: addFavorite                                       │    │
 │  │                                                                │    │
 │  │ 1. Receives action with job payload                           │    │
 │  │ 2. Calls FavoriteService.addFavorite(job) → HTTP POST         │    │
 │  │ 3. On success → dispatches addFavoriteSuccess({favorite})     │    │
 │  │ 4. On failure → dispatches addFavoriteFailure({error})        │    │
 │  └────────────────────────────────────────────────────────────────┘    │
 │                                                                        │
 │  FavoriteService (unchanged — still makes HTTP calls)                  │
 │  ┌────────────────────────────────────────────────────────────────┐    │
 │  │ addFavorite(fav): POST /favorites → Observable<Favorite>      │    │
 │  │ getFavorites():   GET  /favorites → Observable<Favorite[]>    │    │
 │  │ removeFavorite(): DELETE /favorites/:id → Observable<void>    │    │
 │  └────────────────────────────────────────────────────────────────┘    │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Step-by-Step Implementation

### Step 1: Install NgRx

```bash
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
```

| Package | Purpose |
|---|---|
| `@ngrx/store` | The core store, actions, reducers, selectors |
| `@ngrx/effects` | Side effect management (HTTP calls) |
| `@ngrx/store-devtools` | Redux DevTools integration for debugging |

---

### Step 2: Define the State Shape

**File: `src/app/store/favorites/favorites.state.ts`**

```typescript
import { Favorite } from '../../models/favorite.model';

// This interface describes the SHAPE of the favorites slice of state.
// Think of it as a database table schema.
export interface FavoritesState {
  favorites: Favorite[];   // The list of saved favorites
  loading: boolean;         // Is an HTTP request in progress?
  error: string | null;     // The last error message, or null if no error
}

// The starting values when the app first loads.
// The reducer will use this as the initial state.
export const initialFavoritesState: FavoritesState = {
  favorites: [],
  loading: false,
  error: null,
};
```

#### What's happening

- `FavoritesState` is a TypeScript interface — it tells NgRx (and you) exactly what data this feature stores.
- `initialFavoritesState` is the default state. When the app boots, the store starts with this object.
- This replaces the `favorites = signal<Favorite[]>([])` and `loading = signal(false)` that lived inside your component.

#### Why `error: string | null`?

When there's no error, it's `null`. When an HTTP call fails, the effect dispatches a failure action and the reducer sets `error` to the error message. This way your component can show an error banner by reading `selectError` from the store.

---

### Step 3: Create Actions

**File: `src/app/store/favorites/favorites.actions.ts`**

```typescript
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Favorite } from '../../models/favorite.model';
import { Job } from '../../models/job.model';

// createActionGroup groups related actions under a "source" label.
// The source describes WHERE the action comes from (for debugging in DevTools).
export const FavoritesActions = createActionGroup({
  source: 'Favorites',  // Shows as "[Favorites] Load Favorites" in DevTools
  events: {

    // ─── LOAD ───────────────────────────────────────────────
    // Triggered when: FavoritesComponent initializes (ngOnInit)
    // Payload: none
    // Purpose: Tell the system "go fetch all favorites from the server"
    'Load Favorites': emptyProps(),

    // Triggered when: The HTTP GET succeeds inside the effect
    // Payload: { favorites: Favorite[] } — the array returned by the API
    // Purpose: Hand the fetched data to the reducer to store it
    'Load Favorites Success': props<{ favorites: Favorite[] }>(),

    // Triggered when: The HTTP GET fails inside the effect
    // Payload: { error: string } — the error message
    // Purpose: Tell the reducer to set loading=false and save the error
    'Load Favorites Failure': props<{ error: string }>(),

    // ─── ADD ────────────────────────────────────────────────
    // Triggered when: User clicks the ♡ button on a JobCard
    // Payload: { job: Job } — the full job object that the user wants to save
    // Purpose: Tell the system "save this job as a favorite"
    'Add Favorite': props<{ job: Job }>(),

    // Triggered when: The HTTP POST succeeds inside the effect
    // Payload: { favorite: Favorite } — the newly created favorite from the API
    // Purpose: Add the new favorite to the state array
    'Add Favorite Success': props<{ favorite: Favorite }>(),

    // Triggered when: The HTTP POST fails inside the effect
    // Payload: { error: string }
    'Add Favorite Failure': props<{ error: string }>(),

    // ─── REMOVE ─────────────────────────────────────────────
    // Triggered when: User clicks "Remove" on a favorite card
    // Payload: { id: number } — the ID of the favorite to delete
    'Remove Favorite': props<{ id: number }>(),

    // Triggered when: The HTTP DELETE succeeds
    // Payload: { id: number } — the ID that was deleted, so the reducer can filter it out
    'Remove Favorite Success': props<{ id: number }>(),

    // Triggered when: The HTTP DELETE fails
    // Payload: { error: string }
    'Remove Favorite Failure': props<{ error: string }>(),
  },
});
```

#### Deep dive: `createActionGroup`

```typescript
createActionGroup({ source: 'Favorites', events: { ... } })
```

- **`source`**: A string label. NgRx prepends it to every action type → `"[Favorites] Add Favorite"`. This is purely for debugging — when you open Redux DevTools, you see exactly which feature area triggered each action.

- **`events`**: An object where each key is the action name and the value describes its payload.

#### Deep dive: `props<T>()` vs `emptyProps()`

```typescript
// props<T>() — this action carries data
'Add Favorite': props<{ job: Job }>(),
// Usage: store.dispatch(FavoritesActions.addFavorite({ job: myJobObject }))
// The action object becomes: { type: '[Favorites] Add Favorite', job: { id: '123', title: '...' } }

// emptyProps() — this action carries NO data
'Load Favorites': emptyProps(),
// Usage: store.dispatch(FavoritesActions.loadFavorites())
// The action object becomes: { type: '[Favorites] Load Favorites' }
```

`props<{ job: Job }>()` creates a factory function. When you call `FavoritesActions.addFavorite({ job: someJob })`, NgRx returns a plain object:

```typescript
{
  type: '[Favorites] Add Favorite',  // auto-generated from source + event name
  job: { id: '123', title: 'Frontend Developer', ... }
}
```

This object flows through the system — the reducer and effects can read `action.job` to access the payload.

---

### Step 4: Create the Reducer

**File: `src/app/store/favorites/favorites.reducer.ts`**

```typescript
import { createReducer, on } from '@ngrx/store';
import { FavoritesActions } from './favorites.actions';
import { initialFavoritesState } from './favorites.state';

// createReducer takes:
//   1. The initial state
//   2. One or more `on()` handlers that map actions → state transitions
//
// CRITICAL RULE: Reducers must be PURE FUNCTIONS.
//   - No HTTP calls, no side effects, no randomness
//   - Given the same state and action, they ALWAYS return the same new state
//   - They return a NEW object (never mutate the existing state)

export const favoritesReducer = createReducer(
  initialFavoritesState,

  // ─── LOAD ───────────────────────────────────────────────

  // When: loadFavorites is dispatched
  // Current state: whatever it was
  // New state: set loading to true, clear any previous error
  on(FavoritesActions.loadFavorites, (state) => ({
    ...state,           // spread ALL existing properties (favorites, loading, error)
    loading: true,      // override loading to true
    error: null,        // clear any old error
  })),

  // When: loadFavoritesSuccess arrives (from the effect, after HTTP 200)
  // The action carries { favorites: Favorite[] }
  // New state: store the favorites, stop loading
  on(FavoritesActions.loadFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    favorites,          // replace the entire favorites array with the server data
    loading: false,
    error: null,
  })),

  // When: loadFavoritesFailure arrives (from the effect, after HTTP error)
  // The action carries { error: string }
  // New state: stop loading, save the error message
  on(FavoritesActions.loadFavoritesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,              // save error so the component can display it
  })),

  // ─── ADD ────────────────────────────────────────────────

  // When: addFavorite is dispatched (user clicked ♡)
  // We just set loading — the actual HTTP call happens in the effect
  on(FavoritesActions.addFavorite, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // When: addFavoriteSuccess arrives (HTTP POST succeeded)
  // The action carries { favorite: Favorite } — the new favorite from the API
  // We ADD it to the existing array using spread: [...oldArray, newItem]
  on(FavoritesActions.addFavoriteSuccess, (state, { favorite }) => ({
    ...state,
    favorites: [...state.favorites, favorite],   // immutable push
    loading: false,
    error: null,
  })),

  // When: addFavoriteFailure arrives (HTTP POST failed)
  on(FavoritesActions.addFavoriteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ─── REMOVE ─────────────────────────────────────────────

  on(FavoritesActions.removeFavorite, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // When: removeFavoriteSuccess arrives
  // The action carries { id: number }
  // We FILTER OUT the deleted item from the array
  on(FavoritesActions.removeFavoriteSuccess, (state, { id }) => ({
    ...state,
    favorites: state.favorites.filter((f) => f.id !== id),  // immutable delete
    loading: false,
    error: null,
  })),

  on(FavoritesActions.removeFavoriteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
```

#### Deep dive: `on()` function

```typescript
on(
  FavoritesActions.addFavoriteSuccess,   // 1st arg: which action to listen for
  (state, { favorite }) => ({            // 2nd arg: handler function
    ...state,                            //   - state = current FavoritesState
    favorites: [...state.favorites, favorite],
    loading: false,
    error: null,
  })
)
```

- **1st argument**: The action to react to. NgRx matches by the action's `type` string internally.
- **2nd argument**: A function receiving `(currentState, action)`. It MUST return a **new** state object.
  - `state` is the current `FavoritesState`
  - `{ favorite }` is destructured from the action (the payload you defined with `props<{ favorite: Favorite }>()`)

#### Why `...state` (spread)?

NgRx relies on **immutability** for change detection. Angular knows something changed by comparing object references, not deep equality. If you mutate `state.favorites.push(item)`, the array reference stays the same and Angular won't detect the change.

```typescript
// ❌ WRONG — mutates existing state
on(FavoritesActions.addFavoriteSuccess, (state, { favorite }) => {
  state.favorites.push(favorite);  // mutation!
  return state;                     // same reference — Angular won't re-render
})

// ✅ CORRECT — returns a new object
on(FavoritesActions.addFavoriteSuccess, (state, { favorite }) => ({
  ...state,                                      // copy all existing properties into a NEW object
  favorites: [...state.favorites, favorite],     // NEW array with the new item appended
}))
```

---

### Step 5: Create Effects

**File: `src/app/store/favorites/favorites.effects.ts`**

```typescript
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { FavoriteService } from '../../services/favorite.service';
import { FavoritesActions } from './favorites.actions';

@Injectable()
export class FavoritesEffects {
  // inject() is Angular's functional injection.
  // Actions is an Observable stream of ALL dispatched actions in the app.
  private actions$ = inject(Actions);
  private favoriteService = inject(FavoriteService);

  // ─── LOAD FAVORITES ─────────────────────────────────────
  //
  // createEffect() registers an Observable pipeline that:
  //   1. Filters the global action stream for a specific action
  //   2. Performs a side effect (HTTP call)
  //   3. Maps the result to a new action (success or failure)
  //
  // This replaces the subscribe() call that lived in your component.

  loadFavorites$ = createEffect(() =>
    this.actions$.pipe(
      // ofType filters the action stream — only lets through 'loadFavorites' actions.
      // All other actions (addFavorite, removeFavorite, etc.) are ignored here.
      ofType(FavoritesActions.loadFavorites),

      // exhaustMap: When a loadFavorites action comes in, it starts the HTTP call.
      // If ANOTHER loadFavorites arrives while the first is still in-flight,
      // exhaustMap IGNORES the second one. This prevents duplicate requests
      // when users double-click.
      //
      // Other options:
      //   switchMap — cancels the previous request (good for search-as-you-type)
      //   mergeMap  — runs all requests in parallel (good for independent operations)
      //   concatMap — queues requests one after another
      exhaustMap(() =>
        this.favoriteService.getFavorites().pipe(
          // If HTTP succeeds:
          // map() transforms the API response (Favorite[]) into a SUCCESS action.
          // This action will then flow to the reducer, which stores the data.
          map((favorites) =>
            FavoritesActions.loadFavoritesSuccess({ favorites })
          ),

          // If HTTP fails:
          // catchError intercepts the error and returns an Observable of a FAILURE action
          // instead of letting the error crash the effect stream.
          //
          // of() creates a one-shot Observable from the action object.
          // This is needed because the pipe expects Observables, not plain objects.
          catchError((error) =>
            of(FavoritesActions.loadFavoritesFailure({
              error: error.message || 'Failed to load favorites'
            }))
          )
        )
      )
    )
  );

  // ─── ADD FAVORITE ───────────────────────────────────────
  //
  // When addFavorite is dispatched, this effect:
  // 1. Extracts the `job` payload from the action
  // 2. Transforms the Job into a Favorite object
  // 3. Sends it to the JSON server via POST
  // 4. Dispatches success or failure

  addFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.addFavorite),

      // exhaustMap receives the action object, which contains { job: Job }
      // We destructure it to get the job directly.
      exhaustMap(({ job }) => {
        // Transform the Job model into the Favorite model
        // (your API stores a simpler object)
        const favoritePayload = {
          userId: 1,                    // hardcoded for now (no auth yet)
          offerId: parseInt(job.id),    // convert string ID to number
          title: job.title,
          company: job.organization,
          location: job.location,
        };

        return this.favoriteService.addFavorite(favoritePayload).pipe(
          // The API returns the created Favorite (with server-generated id).
          // We wrap it in a success action.
          map((favorite) =>
            FavoritesActions.addFavoriteSuccess({ favorite })
          ),
          catchError((error) =>
            of(FavoritesActions.addFavoriteFailure({
              error: error.message || 'Failed to add favorite'
            }))
          )
        );
      })
    )
  );

  // ─── REMOVE FAVORITE ───────────────────────────────────
  removeFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.removeFavorite),

      exhaustMap(({ id }) =>
        this.favoriteService.removeFavorite(id).pipe(
          // removeFavorite returns void (HTTP 200 with no body).
          // We still need to dispatch a success action so the reducer
          // can remove the item from the state array.
          // We pass the `id` back so the reducer knows WHICH item to filter out.
          map(() =>
            FavoritesActions.removeFavoriteSuccess({ id })
          ),
          catchError((error) =>
            of(FavoritesActions.removeFavoriteFailure({
              error: error.message || 'Failed to remove favorite'
            }))
          )
        )
      )
    )
  );
}
```

#### Deep dive: The Effect pipeline explained

Let's trace `addFavorite$` step by step:

```
this.actions$                          // An infinite Observable stream of ALL actions
  .pipe(                               // flowing through time:
                                       //   [loadFavorites, addFavorite, loadJobs, addFavorite, ...]
                                       //
    ofType(FavoritesActions.addFavorite) // FILTER: only let through actions with
                                        // type === '[Favorites] Add Favorite'
                                        // Result stream: [addFavorite, addFavorite, ...]
                                        //
    exhaustMap(({ job }) =>             // For each addFavorite action that gets through:
                                        //   1. Extract `job` from the action payload
                                        //   2. Start a new inner Observable (the HTTP call)
                                        //   3. Wait for it to complete
                                        //   4. Ignore any new addFavorite actions while in-flight
                                        //
      this.favoriteService              //
        .addFavorite(payload)           //   Make the HTTP POST request
        .pipe(                          //
          map((fav) => successAction),  //   If 200 OK: transform response → success action
          catchError((e) =>             //   If error: transform error → failure action
            of(failureAction)           //     of() wraps the action in an Observable
          )                             //
        )                               //
    )                                   // The output of the entire pipe is an Observable<Action>
  )                                     // NgRx subscribes to it and dispatches each emitted action
```

#### Why `of()` in `catchError`?

`catchError` must return an **Observable**, not a plain object. `of(someAction)` creates an Observable that emits `someAction` once and then completes:

```typescript
// of() creates: ─── someAction ───|
// (emits one value, then completes)
```

Without `of()`, you'd get a TypeScript error because `catchError` expects `Observable<Action>`, not `Action`.

#### Why `exhaustMap` vs `switchMap` vs `mergeMap`?

| Operator | Behavior | Best for |
|---|---|---|
| `exhaustMap` | Ignores new actions while current HTTP is in-flight | Add/Remove (prevent duplicates from double-clicks) |
| `switchMap` | Cancels current HTTP and starts new one | Search/Autocomplete (only care about latest) |
| `mergeMap` | Runs all requests in parallel | Independent operations (load different resources) |
| `concatMap` | Queues requests, runs them one at a time | Order-dependent operations |

For "Add to Favorite", `exhaustMap` is ideal — if a user double-clicks the heart button, the second click is ignored while the first POST is still in progress.

#### Update FavoriteService

You need to add the `addFavorite` method to your existing service:

```typescript
// favorite.service.ts — add this method
addFavorite(favorite: Omit<Favorite, 'id'>): Observable<Favorite> {
  return this.http.post<Favorite>(this.apiUrl, favorite);
}
```

- `Omit<Favorite, 'id'>` — The TypeScript `Omit` utility type creates a new type that has all properties of `Favorite` EXCEPT `id`. Why? Because the server auto-generates the `id` — you don't send it in the POST body.
- Returns `Observable<Favorite>` — The JSON server responds with the created object including the generated `id`.

---

### Step 6: Create Selectors

**File: `src/app/store/favorites/favorites.selectors.ts`**

```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FavoritesState } from './favorites.state';

// createFeatureSelector<FavoritesState>('favorites')
//
// This creates a selector that reaches into the GLOBAL store object and
// pulls out the 'favorites' slice.
//
// Imagine the global state looks like:
// {
//   favorites: { favorites: [...], loading: false, error: null },   ← THIS SLICE
//   jobs: { ... },
//   auth: { ... },
// }
//
// The string 'favorites' must match the key you use when registering
// the reducer in Step 7 (provideState('favorites', favoritesReducer)).
//
// Returns: (globalState) => globalState['favorites']  → FavoritesState

const selectFavoritesState = createFeatureSelector<FavoritesState>('favorites');

// createSelector takes:
//   1. One or more "input selectors" (functions that return parts of the state)
//   2. A "projector function" that combines them into the final value
//
// IMPORTANT: Selectors are MEMOIZED.
// If the input hasn't changed, the selector returns the cached result
// without re-running the projector. This avoids unnecessary re-renders.

// ─── Select the favorites array ─────────────────────
// Input: the favorites feature state
// Output: Favorite[]
export const selectAllFavorites = createSelector(
  selectFavoritesState,                      // input selector
  (state: FavoritesState) => state.favorites // projector: extract just the array
);

// ─── Select the loading flag ────────────────────────
// Input: the favorites feature state
// Output: boolean
export const selectFavoritesLoading = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.loading
);

// ─── Select the error message ───────────────────────
// Input: the favorites feature state
// Output: string | null
export const selectFavoritesError = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.error
);

// ─── Select the count ───────────────────────────────
// This is a DERIVED/COMPUTED value — it doesn't exist in the state,
// it's calculated from the favorites array.
// Thanks to memoization, this only recomputes when the array changes.
export const selectFavoritesCount = createSelector(
  selectAllFavorites,                          // reuse the previous selector as input!
  (favorites) => favorites.length
);

// ─── Check if a specific job is already a favorite ──
// This is a FACTORY SELECTOR — a function that returns a selector.
// You call it with a job ID to get a selector for that specific job.
//
// Usage in component:
//   this.store.select(selectIsFavorite('job-123'))
//
// Why a factory? Because selectors normally don't take extra parameters.
// By wrapping in a function, we can pass the jobId dynamically.
export const selectIsFavorite = (jobId: string) =>
  createSelector(
    selectAllFavorites,
    (favorites) => favorites.some((f) => f.offerId === parseInt(jobId))
  );
```

#### Deep dive: Memoization

```typescript
// Imagine the component calls:
this.store.select(selectFavoritesCount);

// First call:
//   1. selectAllFavorites runs → returns [fav1, fav2, fav3]
//   2. selectFavoritesCount projector runs → returns 3
//   3. Result is CACHED

// Second call (if nothing changed):
//   1. selectAllFavorites runs → returns SAME array reference → CACHE HIT
//   2. selectFavoritesCount projector is SKIPPED → returns cached 3

// Third call (after adding a favorite):
//   1. selectAllFavorites runs → returns [fav1, fav2, fav3, fav4] (new reference)
//   2. selectFavoritesCount projector runs → returns 4
//   3. New result is CACHED
```

This is why immutability matters — if the reducer mutated the existing array instead of creating a new one, the selector would see the same reference and return stale cached data.

---

### Step 7: Register the Store

**File: `src/app/app.config.ts`**

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { apiKeyInterceptor } from './interceptors/api-key-interceptor';
import { favoritesReducer } from './store/favorites/favorites.reducer';
import { FavoritesEffects } from './store/favorites/favorites.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiKeyInterceptor])),

    // ─── NgRx Setup ─────────────────────────────────────────

    // provideStore() initializes the global NgRx store.
    // The object keys become the state slice names.
    // 'favorites' here MUST match the string in createFeatureSelector('favorites')
    provideStore({
      favorites: favoritesReducer,
      // If you add more features later:
      // jobs: jobsReducer,
      // auth: authReducer,
    }),

    // provideEffects() registers effect classes.
    // NgRx will instantiate FavoritesEffects and subscribe to all its effect streams.
    provideEffects([FavoritesEffects]),

    // provideStoreDevtools() enables Redux DevTools browser extension.
    // maxAge: how many past actions to keep in memory for time-travel debugging.
    // logOnly: in production, only log actions (no time-travel to save memory).
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
  ],
};
```

#### What happens at app startup

1. `provideStore({ favorites: favoritesReducer })` →
   NgRx creates the global store with initial state: `{ favorites: { favorites: [], loading: false, error: null } }`

2. `provideEffects([FavoritesEffects])` →
   NgRx instantiates `FavoritesEffects`, subscribes to all `createEffect()` observables, and starts watching the action stream.

3. `provideStoreDevtools(...)` →
   If you have the Redux DevTools extension installed, you can now inspect every action, see state changes, and even "time-travel" backward through actions.

---

### Step 8: Use in Components

#### 8a. FavoritesComponent (reading from store)

```typescript
// pages/favorites/favorites.ts

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FavoritesActions } from '../../store/favorites/favorites.actions';
import { selectAllFavorites, selectFavoritesLoading } from '../../store/favorites/favorites.selectors';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, AsyncPipe], // AsyncPipe needed for the | async pipe in the template
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class FavoritesComponent implements OnInit {
  // store.select() returns an Observable<T> that emits whenever the selected
  // slice of state changes.
  //
  // selectAllFavorites → Observable<Favorite[]>
  // selectFavoritesLoading → Observable<boolean>
  //
  // The $ suffix is a convention meaning "this is an Observable"
  favorites$ = this.store.select(selectAllFavorites);
  loading$ = this.store.select(selectFavoritesLoading);

  // The Store is typed to the global state shape, but you usually
  // don't need to specify the generic — Angular infers it.
  constructor(private store: Store) {}

  ngOnInit(): void {
    // Dispatch the load action. This does NOT make an HTTP call itself.
    // It sends a message to the store saying "I need favorites data."
    // The effect picks it up and makes the actual HTTP call.
    this.store.dispatch(FavoritesActions.loadFavorites());
  }

  removeFavorite(id: number): void {
    // Dispatch the remove action. Same pattern — no HTTP here,
    // the effect handles it.
    this.store.dispatch(FavoritesActions.removeFavorite({ id }));
  }

  getInitials(company: string): string {
    return company
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
}
```

In the template, you use the `| async` pipe to subscribe to observables:

```html
<!-- favorites.html (NgRx version) -->
@if (loading$ | async) {
  <div class="loading">Loading favorites...</div>
} @else {
  @for (fav of favorites$ | async; track fav.id) {
    <!-- render each favorite -->
    <button (click)="removeFavorite(fav.id)">Remove</button>
  }
}
```

The `async` pipe:
- **Subscribes** to the Observable when the component mounts
- **Unsubscribes** automatically when the component is destroyed (no memory leaks!)
- **Triggers change detection** whenever a new value is emitted

#### 8b. JobCardComponent (dispatching add to favorite)

```typescript
// components/job-card/job-card.ts

import { Component, input } from '@angular/core';
import { DatePipe, AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Job } from '../../models/job.model';
import { FavoritesActions } from '../../store/favorites/favorites.actions';
import { selectIsFavorite } from '../../store/favorites/favorites.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-job-card',
  imports: [DatePipe, AsyncPipe],
  templateUrl: './job-card.html',
  styleUrl: './job-card.css',
})
export class JobCardComponent {
  job = input.required<Job>();

  // We'll create isFavorite$ in the constructor or via a getter
  isFavorite$!: Observable<boolean>;

  constructor(private store: Store) {}

  // Because job is a signal-based input, we need to compute the selector
  // after the input is set. We can use ngOnInit or a computed approach.
  ngOnInit(): void {
    // selectIsFavorite is a factory selector — it returns a NEW selector
    // configured for this specific job ID.
    //
    // this.store.select(...) returns Observable<boolean>
    //   - emits `true` if this job exists in the favorites array
    //   - emits `false` if it doesn't
    //   - automatically re-emits whenever favorites change in the store
    this.isFavorite$ = this.store.select(selectIsFavorite(this.job().id));
  }

  addToFavorites(): void {
    // Dispatch the action with the full Job object as payload.
    // The effect will transform it into a Favorite and POST it.
    this.store.dispatch(FavoritesActions.addFavorite({ job: this.job() }));
  }

  getInitials(): string {
    return this.job().organization
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
}
```

In the template:

```html
<!-- job-card.html — updated favorite button -->
<button
  class="btn-fav"
  [class.is-saved]="isFavorite$ | async"
  (click)="addToFavorites()"
  [title]="(isFavorite$ | async) ? 'Saved' : 'Save to favorites'"
>
  <svg ...>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
</button>
```

---

## 5. Complete Flow Walkthrough

Let's trace **exactly** what happens when a user clicks the ♡ button on a job card:

```
STEP 1: USER CLICKS ♡
────────────────────────────────────────────────────
The (click) handler in job-card.html fires.
Calls: this.store.dispatch(FavoritesActions.addFavorite({ job: this.job() }))

This creates the action object:
{
  type: '[Favorites] Add Favorite',
  job: { id: '12345', title: 'Frontend Dev', organization: 'TechCorp', ... }
}

And sends it into the store.


STEP 2: REDUCER PROCESSES THE ACTION
────────────────────────────────────────────────────
The reducer sees an action with type '[Favorites] Add Favorite'.
It matches: on(FavoritesActions.addFavorite, ...)

Previous state:
{
  favorites: [{ id: 1, title: 'Old Favorite', ... }],
  loading: false,
  error: null
}

Reducer returns NEW state:
{
  favorites: [{ id: 1, title: 'Old Favorite', ... }],  ← unchanged
  loading: true,                                         ← SET TO TRUE
  error: null
}

The store updates. Any component selecting `loading` gets notified.
The UI might show a spinner or disable the button.


STEP 3: EFFECT INTERCEPTS THE ACTION
────────────────────────────────────────────────────
The addFavorite$ effect's actions$ stream receives the action.
ofType(FavoritesActions.addFavorite) matches → lets it through.

exhaustMap runs:
  1. Extracts { job } from the action
  2. Creates the Favorite payload: { userId: 1, offerId: 12345, title: '...', ... }
  3. Calls this.favoriteService.addFavorite(payload)
  4. HTTP POST request goes to: http://localhost:3000/favorites


STEP 4a: HTTP SUCCEEDS (200 OK)
────────────────────────────────────────────────────
The JSON server returns:
{ id: 2, userId: 1, offerId: 12345, title: 'Frontend Dev', company: 'TechCorp', location: 'SF' }

The map() operator transforms this into:
FavoritesActions.addFavoriteSuccess({
  favorite: { id: 2, userId: 1, offerId: 12345, ... }
})

This SUCCESS action is dispatched to the store.


STEP 5: REDUCER PROCESSES THE SUCCESS ACTION
────────────────────────────────────────────────────
The reducer sees '[Favorites] Add Favorite Success'.
It matches: on(FavoritesActions.addFavoriteSuccess, ...)

Previous state:
{
  favorites: [{ id: 1, title: 'Old Favorite', ... }],
  loading: true,
  error: null
}

Reducer returns NEW state:
{
  favorites: [
    { id: 1, title: 'Old Favorite', ... },
    { id: 2, title: 'Frontend Dev', ... }     ← NEW ITEM ADDED
  ],
  loading: false,                              ← SET TO FALSE
  error: null
}


STEP 6: SELECTORS NOTIFY COMPONENTS
────────────────────────────────────────────────────
• selectAllFavorites recalculates → [fav1, fav2]
  → FavoritesComponent updates its list (if mounted)
  
• selectFavoritesLoading recalculates → false
  → Spinner disappears

• selectIsFavorite('12345') recalculates → true
  → The ♡ button on this JobCard fills in!
  → ALL OTHER JobCards with the same ID also update!

• selectFavoritesCount recalculates → 2
  → If a header shows "2 saved", it updates automatically
```

```
STEP 4b (ALTERNATE): HTTP FAILS (e.g., 500 error)
────────────────────────────────────────────────────
catchError intercepts the error.
of() creates an Observable emitting:
FavoritesActions.addFavoriteFailure({ error: 'Server error' })

This FAILURE action is dispatched to the store.

The reducer sets: { loading: false, error: 'Server error' }
The component can display the error message.
The favorites array is UNCHANGED — no half-baked state.
```

---

## 6. Your Current Code vs NgRx Code

### Before (Component manages everything)

```
Component
├── Holds state (signals)
├── Calls HTTP service directly  
├── Handles success/error in subscribe()
└── Manually updates its own state
```

```typescript
// Component does EVERYTHING
removeFavorite(id: number): void {
  this.favoriteService.removeFavorite(id).subscribe({
    next: () => {
      this.favorites.update((list) => list.filter((f) => f.id !== id));
    },
    error: (err) => {
      console.error('Failed to remove favorite:', err);
    },
  });
}
```

### After (Responsibilities are separated)

```
Component ──→ dispatches Action ──→ "Remove favorite #5"
    ↑                                       │
    │                                       ▼
    │                              Effect intercepts
    │                              calls HTTP service
    │                              dispatches Success/Failure
    │                                       │
    │                                       ▼
    │                              Reducer updates state
    │                                       │
    │                                       ▼
    └──────── Selector ◄──────── Store (new state)
```

```typescript
// Component does ONE thing: dispatch
removeFavorite(id: number): void {
  this.store.dispatch(FavoritesActions.removeFavorite({ id }));
}

// Effect does ONE thing: handle the HTTP call
removeFavorite$ = createEffect(() =>
  this.actions$.pipe(
    ofType(FavoritesActions.removeFavorite),
    exhaustMap(({ id }) =>
      this.favoriteService.removeFavorite(id).pipe(
        map(() => FavoritesActions.removeFavoriteSuccess({ id })),
        catchError((e) => of(FavoritesActions.removeFavoriteFailure({ error: e.message })))
      )
    )
  )
);

// Reducer does ONE thing: update state
on(FavoritesActions.removeFavoriteSuccess, (state, { id }) => ({
  ...state,
  favorites: state.favorites.filter((f) => f.id !== id),
  loading: false,
}))
```

---

## 7. Key Concepts Summary

### The Golden Rules

| Rule | Why |
|---|---|
| Components ONLY dispatch and select | They don't know about HTTP or state shape |
| Reducers are PURE functions | No side effects → predictable, testable, re-playable |
| Effects handle ALL side effects | HTTP, localStorage, timers, etc. |
| State is IMMUTABLE | Always return new objects → reliable change detection |
| Selectors are MEMOIZED | Only recompute when inputs change → performance |

### File Structure for your project

```
src/app/store/
  favorites/
    favorites.state.ts      ← State interface + initial state
    favorites.actions.ts    ← Action definitions (what can happen)
    favorites.reducer.ts    ← How state changes (pure transformations)
    favorites.effects.ts    ← Side effects (HTTP calls)
    favorites.selectors.ts  ← How to read from state (queries)
```

### When to use NgRx vs Signals

| Use NgRx when... | Use Signals when... |
|---|---|
| State is shared across multiple components | State is local to one component |
| State involves async operations (HTTP) | State is simple and synchronous |
| You need predictable state transitions | You don't need a history of state changes |
| You need Redux DevTools for debugging | The component is simple enough to debug visually |
| Multiple actions can affect the same state | Only one component modifies the state |

### Debugging with Redux DevTools

Install the [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) Chrome extension. With `provideStoreDevtools()` configured, you can:

1. **See every action** dispatched in real time
2. **Inspect state** before and after each action
3. **Time-travel** — click any past action to revert the state to that point
4. **Export/Import** state for bug reports

---

### Quick Reference: Function Signatures

```typescript
// ACTIONS
createActionGroup({ source: string, events: { [name]: props<T>() | emptyProps() } })
props<T>()           // → ActionCreator that requires payload of type T
emptyProps()         // → ActionCreator that requires no payload

// REDUCER
createReducer(initialState, ...on())
on(action, (state, payload) => newState)   // returns new state object

// EFFECTS
createEffect(() => actions$.pipe(...))     // returns Observable<Action>
ofType(action)                              // filters action stream
exhaustMap(fn)                              // maps to inner Observable, ignores concurrent

// SELECTORS
createFeatureSelector<T>(key)              // selects a top-level state slice
createSelector(inputSelector, projectorFn) // derives data from state, memoized

// STORE (used in components)
store.dispatch(action)                     // sends action into the system
store.select(selector)                     // returns Observable<T> of selected state
```
