import React, { useState, useEffect } from "react";
import { Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";

const Login = () => {
  const { login, isAuthenticated, loading: authLoading, error: authError, clearError } = useAuth();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const successMessage = location.state?.message;

  // Nettoyer les erreurs quand les champs changent
  useEffect(() => {
    if (loginError || authError) {
      setLoginError(null);
      clearError();
    }
  }, [formData.login, formData.password]);

  // Redirection si déjà authentifié
  if (isAuthenticated && !authLoading && !isLogging) {
    console.log("✅ Déjà authentifié, redirection vers:", from);
    return <Navigate to={from} replace />;
  }

  // Écran de chargement initial
  if (authLoading && !isLogging) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-gray-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.login.trim() || !formData.password.trim()) {
      setLoginError("Veuillez remplir tous les champs");
      return;
    }

    setIsLogging(true);
    setLoginError(null);
    clearError();

    try {
      console.log('🎯 Début du processus de connexion...');
      const result = await login(formData);
      
      if (result.success) {
        console.log('✅ Connexion réussie dans le composant');
        toast.success(result.message || "Connexion réussie !");
        
        // Redirection après un court délai pour le feedback visuel
        setTimeout(() => {
          setIsLogging(false);
          navigate(from, { replace: true });
        }, 500);
      } else {
        console.error('❌ Échec connexion dans le composant:', result.error);
        setLoginError(result.error);
        toast.error(result.error || "Erreur de connexion");
        setIsLogging(false);
      }
    } catch (err) {
      console.error("💥 Erreur inattendue dans handleSubmit:", err);
      const errorMsg = "Une erreur inattendue est survenue lors de la connexion";
      setLoginError(errorMsg);
      toast.error(errorMsg);
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Formulaire principal */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* Header avec icône */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
              <Lock className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
            <p className="text-sm text-gray-600">Gestion des Services</p>
            <p className="text-sm text-gray-500">Simplon Côte d'Ivoire</p>
          </div>

          {/* Message de succès */}
          {successMessage && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md mb-4">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Champ Nom d'utilisateur ou Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur ou Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="login"
                  name="login"
                  type="text"
                  required
                  value={formData.login}
                  onChange={handleChange}
                  disabled={isLogging}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  placeholder="Nom d'utilisateur ou email"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  autoComplete="off"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLogging}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLogging}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Erreurs */}
            {(loginError || authError) && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{loginError || authError}</span>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLogging}
              className="w-full py-2.5 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isLogging ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Connexion...
                </div>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Section informations de connexion */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="text-sm font-semibold text-red-600 mb-3 text-center">
              Informations de connexion
            </h3>
            <ul className="text-xs text-gray-700 space-y-1.5">
              <li>• Utilisez votre nom d'utilisateur ou email</li>
              <li>• Vos identifiants vous ont été transmis par email</li>
              <li>• Vous pouvez modifier votre mot de passe après connexion</li>
              <li>• En cas de problème, contactez l'administrateur</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <div className="text-gray-500 text-xs">
          <p>
            © 2025 <span className="text-red-600 font-medium">Simplon</span> Côte d'Ivoire – Gestion Services
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;