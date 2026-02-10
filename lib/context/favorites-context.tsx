"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { FavoriteItem } from "@/types/tools";

const FAVORITES_STORAGE_KEY = "devflow-favorites";

// --- State & Actions ---
interface FavoritesState {
  favorites: FavoriteItem[];
  isLoading: boolean;
}

type FavoritesAction =
  | { type: "LOAD_FAVORITES"; payload: FavoriteItem[] }
  | { type: "ADD_FAVORITE"; payload: string }
  | { type: "REMOVE_FAVORITE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean };

// --- Reducer ---
function favoritesReducer(
  state: FavoritesState,
  action: FavoritesAction
): FavoritesState {
  switch (action.type) {
    case "LOAD_FAVORITES":
      return { ...state, favorites: action.payload, isLoading: false };

    case "ADD_FAVORITE":
      return {
        ...state,
        favorites: [
          ...state.favorites,
          { toolId: action.payload, addedAt: new Date().toISOString() },
        ],
      };

    case "REMOVE_FAVORITE":
      return {
        ...state,
        favorites: state.favorites.filter(
          (fav) => fav.toolId !== action.payload
        ),
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// --- Context ---
interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorite: (toolId: string) => boolean;
  toggleFavorite: (toolId: string) => void;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

// --- Provider ---
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, {
    favorites: [],
    isLoading: true,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
    try {
      const parsed = saved ? (JSON.parse(saved) as FavoriteItem[]) : [];
      dispatch({ type: "LOAD_FAVORITES", payload: parsed });
    } catch {
      dispatch({ type: "LOAD_FAVORITES", payload: [] });
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(state.favorites)
      );
    }
  }, [state.favorites, state.isLoading]);

  const isFavorite = useCallback(
    (toolId: string) => state.favorites.some((fav) => fav.toolId === toolId),
    [state.favorites]
  );

  const toggleFavorite = useCallback(
    (toolId: string) => {
      if (isFavorite(toolId)) {
        dispatch({ type: "REMOVE_FAVORITE", payload: toolId });
      } else {
        dispatch({ type: "ADD_FAVORITE", payload: toolId });
      }
    },
    [isFavorite]
  );

  const value: FavoritesContextType = {
    favorites: state.favorites,
    isFavorite,
    toggleFavorite,
    isLoading: state.isLoading,
  };

  // React 19: use <Context> directly instead of <Context.Provider>
  return <FavoritesContext value={value}>{children}</FavoritesContext>;
}

// --- Hook ---
export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
