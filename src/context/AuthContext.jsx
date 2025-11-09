import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { authAPI } from "../services/api"; // Assurez-vous que c'est le bon chemin

const AuthContext = createContext();

const debugLog = (...args) => {
  if (import.meta.env?.DEV) {
    console.debug("[AuthContext]", ...args);
  }
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case "LOGIN_ERROR":
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case "INIT_START":
      return { ...state, loading: true };
    case "INIT_COMPLETE":
      return { ...state, loading: false };
    case "AUTH_ERROR":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initRef = useRef(false);

  const getCurrentUser = useCallback(async () => {
    try {
      debugLog("Vérification de l'authentification en cours");
      const response = await authAPI.getCurrentUser();
      debugLog("Utilisateur authentifié", response.data?.id);
      dispatch({ type: "SET_USER", payload: response.data });
      return response.data;
    } catch (error) {
      console.error("Erreur getCurrentUser:", error);
      const status = error?.response?.status;

      // Tentative automatique de refresh en cas de 401
      if (status === 401) {
        debugLog("Tentative de refresh automatique après 401");
        try {
          await authAPI.refreshToken();
          const retryResponse = await authAPI.getCurrentUser();
          dispatch({ type: "SET_USER", payload: retryResponse.data });
          return retryResponse.data;
        } catch (refreshError) {
          console.error("❌ Refresh automatique échoué:", refreshError);
        }
      }

      dispatch({ type: "AUTH_ERROR" });
      throw error;
    }
  }, []);

  // Vérification initiale de l'authentification
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let mounted = true;

    const checkAuth = async () => {
      if (!mounted) return;

      dispatch({ type: "INIT_START" });

      try {
        await getCurrentUser();
      } catch (error) {
        debugLog("Utilisateur non connecté", error.message);
        dispatch({ type: "AUTH_ERROR" });
      } finally {
        if (mounted) {
          dispatch({ type: "INIT_COMPLETE" });
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [getCurrentUser]);

  const login = async (credentials) => {
    dispatch({ type: "LOGIN_START" });
    dispatch({ type: "CLEAR_ERROR" });
    
    try {
      debugLog("Tentative de connexion");
      const response = await authAPI.login(credentials);
      debugLog("Réponse login reçue");

      // Vérifier la structure de la réponse
      if (response.data && response.data.success) {
        debugLog("Login réussi, mise à jour du contexte");
        let userData = response.data.user;

        // Si le backend ne renvoie pas l'utilisateur, on le récupère
        if (!userData) {
          const currentUser = await authAPI.getCurrentUser();
          userData = currentUser.data;
        }

        dispatch({ type: "LOGIN_SUCCESS", payload: userData });

        return { success: true, message: response.data.message };
      } else {
        console.error("Structure de réponse invalide:", response.data);
        throw new Error("Structure de réponse invalide");
      }
    } catch (error) {
      console.error("Erreur de login complète:", error);
      
      let errorMessage = "Erreur de connexion";
      
      if (error.response) {
        // Le serveur a répondu avec un statut d'erreur
        const serverError = error.response.data;
        errorMessage = serverError.error || 
                      serverError.details || 
                      serverError.message || 
                      `Erreur ${error.response.status}`;
        
        console.error("Erreur serveur:", serverError);
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion.";
        console.error("Pas de réponse serveur:", error.request);
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        errorMessage = error.message;
        console.error("Erreur configuration:", error.message);
      }
      
      dispatch({ type: "LOGIN_ERROR", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = useCallback(async () => {
    debugLog("Déconnexion en cours");

    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Erreur lors de l'appel logout API:", error);
    } finally {
      // Nettoyer quoi qu'il arrive
      dispatch({ type: "LOGOUT" });
      debugLog("État local nettoyé après logout");
    }
  }, []);

  const updateUser = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(state.user.id, profileData);
      dispatch({ type: "UPDATE_USER", payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erreur updateUser:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.email?.[0] ||
        error.response?.data?.username?.[0] ||
        "Erreur lors de la mise à jour du profil";
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Erreur changePassword:", error);
      const errorMessage =
        error.response?.data?.old_password?.[0] ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Erreur lors du changement de mot de passe";
      return { success: false, error: errorMessage };
    }
  };

  const isUserAuthenticated = () => {
    return state.isAuthenticated;
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    ...state,
    login,
    logout,
    getCurrentUser,
    updateUser,
    changePassword,
    isUserAuthenticated,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
