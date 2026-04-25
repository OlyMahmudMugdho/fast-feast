import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../core/api_client.dart';

class CartProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  final Map<String, CartItem> _items = {};

  Map<String, CartItem> get items => {..._items};

  int get itemCount => _items.length;

  double get totalAmount {
    var total = 0.0;
    _items.forEach((key, cartItem) {
      total += cartItem.item.price * cartItem.quantity;
    });
    return total;
  }

  void addItem(FoodItem food) {
    if (_items.containsKey(food.id)) {
      _items.update(
        food.id,
        (existing) => CartItem(item: existing.item, quantity: existing.quantity + 1),
      );
    } else {
      _items.putIfAbsent(
        food.id,
        () => CartItem(item: food),
      );
    }
    notifyListeners();
  }

  void removeItem(String id) {
    _items.remove(id);
    notifyListeners();
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }

  Future<String?> placeOrder(String address, String shopId, {String paymentMethod = 'STRIPE'}) async {
    try {
      final List<Map<String, dynamic>> orderItems = [];
      _items.forEach((key, cartItem) {
        orderItems.add({
          'food_item_id': cartItem.item.id,
          'quantity': cartItem.quantity,
        });
      });

      final response = await _apiClient.post('/orders', {
        'shop_id': shopId,
        'items': orderItems,
        'delivery_address': address,
        'payment_method': paymentMethod,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        clear();
        return data['checkout_url']; // For Stripe redirection
      }
    } catch (e) {
      debugPrint('Place order error: $e');
    }
    return null;
  }
}
