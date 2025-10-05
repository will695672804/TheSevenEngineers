import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Créer une commande
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { paymentMethod, shippingAddress } = req.body;

  // Récupérer les éléments du panier
  db.all(`
    SELECT ci.*, 
           CASE 
             WHEN ci.item_type = 'course' THEN c.title
             WHEN ci.item_type = 'product' THEN p.name
           END as item_name,
           CASE 
             WHEN ci.item_type = 'course' THEN c.price
             WHEN ci.item_type = 'product' THEN p.price
           END as item_price
    FROM cart_items ci
    LEFT JOIN courses c ON ci.item_type = 'course' AND ci.item_id = c.id
    LEFT JOIN products p ON ci.item_type = 'product' AND ci.item_id = p.id
    WHERE ci.user_id = ?
  `, [userId], (err, cartItems) => {
    if (err) {
      console.error('Erreur lors de la récupération du panier:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Le panier est vide' });
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.item_price * item.quantity), 0);

    // Créer la commande
    db.run(
      'INSERT INTO orders (user_id, total_amount, payment_method, shipping_address) VALUES (?, ?, ?, ?)',
      [userId, totalAmount, paymentMethod, shippingAddress],
      function(err) {
        if (err) {
          console.error('Erreur lors de la création de la commande:', err);
          return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        const orderId = this.lastID;

        // Ajouter les éléments de la commande
        const orderItemsPromises = cartItems.map(item => {
          return new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO order_items (order_id, item_id, item_type, item_name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
              [orderId, item.item_id, item.item_type, item.item_name, item.item_price, item.quantity],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });

        Promise.all(orderItemsPromises)
          .then(() => {
            // Traiter les inscriptions aux cours
            const courseItems = cartItems.filter(item => item.item_type === 'course');
            const enrollmentPromises = courseItems.map(item => {
              return new Promise((resolve, reject) => {
                db.run(
                  'INSERT OR IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)',
                  [userId, item.item_id],
                  (err) => {
                    if (err) reject(err);
                    else {
                      // Mettre à jour le nombre d'étudiants
                      db.run(
                        'UPDATE courses SET students_count = students_count + 1 WHERE id = ?',
                        [item.item_id]
                      );
                      resolve();
                    }
                  }
                );
              });
            });

            return Promise.all(enrollmentPromises);
          })
          .then(() => {
            // Mettre à jour le stock des produits
            const productItems = cartItems.filter(item => item.item_type === 'product');
            const stockPromises = productItems.map(item => {
              return new Promise((resolve, reject) => {
                db.run(
                  'UPDATE products SET stock = stock - ? WHERE id = ?',
                  [item.quantity, item.item_id],
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            });

            return Promise.all(stockPromises);
          })
          .then(() => {
            // Vider le panier
            db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);

            res.status(201).json({
              message: 'Commande créée avec succès',
              orderId: orderId,
              totalAmount: totalAmount
            });
          })
          .catch(err => {
            console.error('Erreur lors du traitement de la commande:', err);
            res.status(500).json({ message: 'Erreur lors du traitement de la commande' });
          });
      }
    );
  });
});

// Obtenir les commandes de l'utilisateur
router.get('/my-orders', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT o.*, 
           GROUP_CONCAT(oi.item_name, ', ') as items_summary
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [userId], (err, orders) => {
    if (err) {
      console.error('Erreur lors de la récupération des commandes:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    res.json({ orders });
  });
});

// Obtenir une commande spécifique
router.get('/:id', authenticateToken, (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  // Récupérer la commande
  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId],
    (err, order) => {
      if (err) {
        console.error('Erreur lors de la récupération de la commande:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (!order) {
        return res.status(404).json({ message: 'Commande non trouvée' });
      }

      // Récupérer les éléments de la commande
      db.all(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId],
        (err, items) => {
          if (err) {
            console.error('Erreur lors de la récupération des éléments de commande:', err);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
          }

          order.items = items;
          res.json({ order });
        }
      );
    }
  );
});

// Routes d'administration
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT o.*, u.name as user_name, u.email as user_email,
           GROUP_CONCAT(oi.item_name, ', ') as items_summary
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, orders) => {
    if (err) {
      console.error('Erreur lors de la récupération des commandes:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    res.json({ orders });
  });
});

// Mettre à jour le statut d'une commande
router.patch('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }

  db.run(
    'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, orderId],
    function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour du statut:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Commande non trouvée' });
      }

      res.json({ message: 'Statut mis à jour avec succès' });
    }
  );
});

export default router;