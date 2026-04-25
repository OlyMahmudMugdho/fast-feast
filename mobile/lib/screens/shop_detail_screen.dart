import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../core/api_client.dart';
import '../models/models.dart';
import '../providers/cart_provider.dart';

class ShopDetailScreen extends StatefulWidget {
  final Shop shop;
  const ShopDetailScreen({super.key, required this.shop});

  @override
  State<ShopDetailScreen> createState() => _ShopDetailScreenState();
}

class _ShopDetailScreenState extends State<ShopDetailScreen> {
  final ApiClient _apiClient = ApiClient();
  List<FoodItem> _items = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchMenu();
  }

  Future<void> _fetchMenu() async {
    try {
      final response = await _apiClient.get('/public/shops/${widget.shop.id}/items');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _items = data.map((i) => FoodItem.fromJson(i)).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching menu: $e');
      setState(() { _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);

    return Scaffold(
      appBar: AppBar(title: Text(widget.shop.name)),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/cart'),
        label: Text('Cart (${cart.itemCount})'),
        icon: const Icon(Icons.shopping_cart),
        backgroundColor: Colors.redAccent,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                color: Colors.redAccent.withOpacity(0.05),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.shop.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                    Text(widget.shop.address, style: TextStyle(color: Colors.grey[600])),
                  ],
                ),
              ),
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _items.length,
                  separatorBuilder: (ctx, i) => const Divider(height: 32),
                  itemBuilder: (ctx, i) {
                    final item = _items[i];
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Image
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: CachedNetworkImage(
                            imageUrl: item.imageUrl ?? 'https://picsum.photos/seed/${item.id}/100/100',
                            width: 80,
                            height: 80,
                            fit: BoxFit.cover,
                            errorWidget: (context, url, error) => Container(color: Colors.grey[200], child: const Icon(Icons.fastfood)),
                          ),
                        ),
                        const SizedBox(width: 16),
                        // Details
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(
                                item.description, 
                                maxLines: 2, 
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(color: Colors.grey[600], fontSize: 13),
                              ),
                              const SizedBox(height: 8),
                              Text('\$${item.price.toStringAsFixed(2)}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 15)),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Add Button
                        Column(
                          children: [
                            const SizedBox(height: 20), // Alignment with text
                            SizedBox(
                              height: 36,
                              child: ElevatedButton(
                                onPressed: () {
                                  cart.addItem(item);
                                  success('Added ${item.name}');
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.redAccent,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 16),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  elevation: 0,
                                ),
                                child: const Text('Add', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    );
                  },
                ),
              ),
              const SizedBox(height: 80), // Padding for FAB
            ],
          ),
    );
  }
}

extension MessageHelper on State {
  void success(String msg) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), duration: const Duration(seconds: 1)));
  }
}
