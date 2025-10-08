import { ArrowLeft, Download, Printer as Print } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { apiService } from "../services/api";

const InvoicePage: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();

  // Générer un numéro de facture unique
  const invoiceNumber = `2025-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;

  // Dates
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 30);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Calculs TVA (20% comme dans l'application)
  const totalHT = total;
  const tvaRate = 0.2;
  const tvaAmount = totalHT * tvaRate;
  const totalTTC = totalHT + tvaAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Simulation du téléchargement
    alert(
      "Fonctionnalité de téléchargement à implémenter avec un service backend"
    );
  };

  const handlePaymentComplete = async () => {
    try {
      // Créer la commande via l'API
      await apiService.createOrder("Mobile Money", "N/A"); // Adresse non disponible sur le type User
      await clearCart(); // Vider le panier après paiement réussi
      alert("Paiement effectué avec succès ! Merci pour votre commande.");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Une erreur est survenue lors du traitement de votre paiement.");
    }
  };

  if (items.length === 0) {
    return (
      <div
        className="min-h-full bg-gray-50 flex items-center justify-center"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Aucune facture à afficher
          </h2>
          <Link
            to="/cart"
            className="text-blue-600 flex justify-center items-center gap-2 hover:text-blue-700 text-sm"
          >
            <ArrowLeft size={18} /> Retour au panier
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Actions Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            to="/cart"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour au panier
          </Link>
          <div className="flex space-x-4">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Print className="h-4 w-4 mr-2" />
              Imprimer
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-lg overflow-hidden invoice-content">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center space-x-3">
                <div className="logo">
                  <img
                    src="/images/THE7E_LOGO.png"
                    className="w-11 h-11 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-blue-600">
                    THE SEVEN ENGINEER
                  </h1>
                  <p className="text-gray-600">
                    Centre de Formation & Bureau d'Étude
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  FACTURE - {invoiceNumber}
                </h2>
                <p className="text-gray-600">
                  Date de facturation: {formatDate(today)}
                </p>
                <p className="text-gray-600">Échéance: {formatDate(dueDate)}</p>
              </div>
            </div>

            {/* Company and Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">
                  THE SEVEN ENGINEER - Centre de formation
                </h3>
                <div className="text-gray-600 space-y-1">
                  <p>THE SEVEN ENGINEER</p>
                  <p>Ngaoundéré 3ème, Bini</p>
                  <p>Mini-cité la Marseillaise</p>
                  <p>À 100m de la nationale Ngaoundéré-Garoua</p>
                  <p>+237 674 13 66 97</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-3">
                  {user?.name || "Client"}
                </h3>
                <div className="text-gray-600 space-y-1">
                  <p>{user?.email || "email@example.com"}</p>
                  <p>Ngaoundéré</p>
                  <p>Cameroun</p>
                </div>
              </div>
            </div>

            {/* Thank you message */}
            <div className="mb-6">
              <p className="text-gray-700">
                Merci d'avoir choisi THE SEVEN ENGINEER !
              </p>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Qté
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Unité
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Prix unitaire
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      TVA
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(today)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {typeof item.quantity === "number"
                          ? item.quantity.toFixed(2)
                          : "1.00"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.type === "course" ? "formation" : "pce"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.price.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        20,0 %
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="font-medium">Total HT</span>
                  <span className="font-medium">{totalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">TVA 20,0 %</span>
                  <span className="font-medium">{tvaAmount.toFixed(2)} €</span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between py-2">
                    <span className="text-lg font-bold">Total TTC</span>
                    <span className="text-lg font-bold">
                      {totalTTC.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  Moyens de paiement:
                </h4>
                <div className="text-gray-600 space-y-1">
                  <p>Mobile Money: +237 674 13 66 97</p>
                  <p>Orange Money: +237 694 01 82 07</p>
                  <p>Virement bancaire disponible</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  Conditions de paiement:
                </h4>
                <p className="text-gray-600">30 jours</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-600 text-sm border-t border-gray-200 pt-6">
              <p className="font-medium">
                THE SEVEN ENGINEER - Centre de formation
              </p>
              <p>Ngaoundéré 3ème, Bini - Mini-cité la Marseillaise</p>
              <p>- "La qualité au service de tous" -</p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="mt-8 text-center print:hidden">
          <button
            onClick={handlePaymentComplete}
            disabled={!user}
            className={`px-8 py-4 rounded-lg font-medium text-lg transition-colors ${
              user
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Confirmer le paiement - {totalTTC.toFixed(2)} €
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
