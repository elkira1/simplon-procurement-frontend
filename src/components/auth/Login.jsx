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
  const {
    login,
    isAuthenticated,
    loading: authLoading,
    error: authError,
    clearError,
  } = useAuth();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [touched, setTouched] = useState({ login: false, password: false });
  const [fieldErrors, setFieldErrors] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const successMessage = location.state?.message;

  const validators = {
    login: (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return "Identifiant obligatoire";
      }
      if (trimmed.length < 3) {
        return "Minimum 3 caractères";
      }
      return "";
    },
    password: (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return "Mot de passe obligatoire";
      }
      if (trimmed.length < 6) {
        return "Minimum 6 caractères";
      }
      return "";
    },
  };

  const runFieldValidation = (name, value) => {
    const validator = validators[name];
    if (!validator) return "";
    const message = validator(value ?? "");
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
    return message;
  };

  const validateForm = () => {
    const results = Object.keys(validators).reduce((acc, key) => {
      acc[key] = validators[key](formData[key]);
      return acc;
    }, {});
    setFieldErrors(results);
    return Object.values(results).every((msg) => !msg);
  };

  // Nettoyer les erreurs quand les champs changent
  useEffect(() => {
    if (loginError || authError) {
      setLoginError(null);
      clearError();
    }
  }, [formData.login, formData.password, authError, clearError, loginError]);

  // Redirection si déjà authentifié
  if (isAuthenticated && !authLoading && !isLogging) {
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      runFieldValidation(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    runFieldValidation(name, formData[name]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setTouched({ login: true, password: true });
      setLoginError("Veuillez corriger les champs surlignés");
      return;
    }

    setIsLogging(true);
    setLoginError(null);
    clearError();

    try {
      const result = await login(formData);
      
      if (result.success) {
        toast.success(result.message || "Connexion réussie !");
        
        // Redirection après un court délai pour le feedback visuel
        setTimeout(() => {
          setIsLogging(false);
          navigate(from, { replace: true });
        }, 500);
      } else {
        console.error("Échec connexion:", result.error);
        setLoginError(result.error);
        toast.error(result.error || "Erreur de connexion");
        setIsLogging(false);
      }
    } catch (err) {
      console.error("Erreur inattendue dans handleSubmit:", err);
      const errorMsg = "Une erreur inattendue est survenue lors de la connexion";
      setLoginError(errorMsg);
      toast.error(errorMsg);
      setIsLogging(false);
    }
  };

  const isFormValid =
    Object.values(fieldErrors).every((msg) => !msg) &&
    formData.login.trim() !== "" &&
    formData.password.trim() !== "";

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
                  onBlur={handleBlur}
                  disabled={isLogging}
                  aria-invalid={Boolean(fieldErrors.login)}
                  aria-describedby="login-helper"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.login
                      ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                      : "border-gray-300 focus:ring-gray-400 focus:border-gray-400"
                  }`}
                  placeholder="Nom d'utilisateur ou email"
                />
              </div>
              {fieldErrors.login && touched.login && (
                <p id="login-helper" className="text-xs text-red-600 mt-1">
                  {fieldErrors.login}
                </p>
              )}
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
                  onBlur={handleBlur}
                  disabled={isLogging}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby="password-helper"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-md focus:outline-none focus:ring-2 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.password
                      ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                      : "border-gray-300 focus:ring-gray-400 focus:border-gray-400"
                  }`}
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
              {fieldErrors.password && touched.password && (
                <p id="password-helper" className="text-xs text-red-600 mt-1">
                  {fieldErrors.password}
                </p>
              )}
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
              disabled={isLogging || !isFormValid}
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
