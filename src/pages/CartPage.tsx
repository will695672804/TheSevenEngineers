import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div
        className="min-h-full bg-gray-50 py-12"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 mb-8">
              Découvrez nos formations et produits pour commencer vos achats
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voir les formations
              </Link>
              <Link
                to="/shop"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Voir la boutique
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Panier</h1>
          <Link
            to="/shop"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Continuer mes achats
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {item.type}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {item.price}€
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.type, item.quantity - 1)
                        }
                        className="p-2 text-gray-600 hover:text-gray-900"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(
                              item.id,
                              item.type,
                              item.quantity - 1
                            );
                          }
                        }}
                        className="p-2 text-gray-600 hover:text-gray-900"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.type)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Vider le panier
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Résumé de la commande
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium text-green-600">Gratuite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span className="font-medium">
                    {(total * 0.2).toFixed(2)}€
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {(total * 1.2).toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/invoice")}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-4"
              >
                Procéder au paiement
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500">Paiement sécurisé</p>
                <p className="text-sm text-gray-500">
                  Garantie satisfait ou remboursé
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
