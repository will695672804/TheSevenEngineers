import { AlertCircle, ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Email ou mot de passe incorrect");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Une erreur s'est produite lors de la connexion");
    }
  };

  return (
    <div
      className="min-h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <div className="bg-blue-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Connexion</h2>
            <p className="text-gray-600 mt-2">
              Accédez à votre espace personnel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center mb-3">
              Comptes de démonstration :
            </p>
            <div className="space-y-2 text-xs">
              <div className="bg-white p-2 rounded border">
                <strong>Admin:</strong> admin@example.com / admin
              </div>
              <div className="bg-white p-2 rounded border">
                <strong>Utilisateur:</strong> user@example.com / user
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              S'inscrire
            </Link>
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-blue-600 flex justify-center items-center gap-2 hover:text-blue-700 text-sm"
            >
              <ArrowLeft size={17} /> Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
