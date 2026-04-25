import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../core/api_client.dart';
import '../models/models.dart';
import '../providers/cart_provider.dart';
import 'shop_detail_screen.dart';

class BuyerDashboard extends StatefulWidget {
  const BuyerDashboard({super.key});

  @override
  State<BuyerDashboard> createState() => _BuyerDashboardState();
}

class _BuyerDashboardState extends State<BuyerDashboard> {
  final ApiClient _apiClient = ApiClient();
  List<Shop> _shops = [];
  List<FoodItem> _dishes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() { _isLoading = true; });
    try {
      final shopsRes = await _apiClient.get('/public/shops');
      final dishesRes = await _apiClient.get('/public/items');
      
      if (shopsRes.statusCode == 200 && dishesRes.statusCode == 200) {
        final List<dynamic> shopData = jsonDecode(shopsRes.body);
        final List<dynamic> dishData = jsonDecode(dishesRes.body);
        
        if (mounted) {
          setState(() {
            _shops = shopData.map((s) => Shop.fromJson(s)).toList();
            _dishes = dishData.map((d) => FoodItem.fromJson(d)).toList();
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching marketplace: $e');
      if (mounted) setState(() { _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);

    // Guard clause: ensure lists are initialized
    final dishesCount = _dishes.length;
    final shopsCount = _shops.length;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : CustomScrollView(
            slivers: [
              // Search Header
              SliverAppBar(
                floating: true,
                title: const Text('Fast-Feast Marketplace'),
                backgroundColor: Colors.white,
                surfaceTintColor: Colors.transparent,
                bottom: PreferredSize(
                  preferredSize: const Size.fromHeight(60),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Search for food or restaurants...',
                        prefixIcon: const Icon(Icons.search),
                        filled: true,
                        fillColor: Colors.grey[100],
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ),
                ),
              ),
              
              // Trending Dishes Section
              if (dishesCount > 0) SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Trending Dishes', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 220,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: dishesCount,
                          itemBuilder: (ctx, i) {
                            final dish = _dishes[i];
                            return _buildDishCard(dish, cart);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // All Restaurants Section
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverToBoxAdapter(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(shopsCount > 0 ? 'Popular Restaurants' : 'No restaurants available', 
                           style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      if (shopsCount > 0) TextButton(onPressed: () {}, child: const Text('View All')),
                    ],
                  ),
                ),
              ),

              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) {
                    final shop = _shops[i];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: _buildShopCard(shop),
                    );
                  },
                  childCount: shopsCount,
                ),
              ),
              const SliverPadding(padding: EdgeInsets.only(bottom: 80)),
            ],
          ),
    );
  }

  Widget _buildDishCard(FoodItem dish, CartProvider cart) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 12),
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CachedNetworkImage(
              imageUrl: dish.imageUrl ?? 'https://picsum.photos/seed/${dish.id}/200/120',
              height: 100,
              width: double.infinity,
              fit: BoxFit.cover,
              errorWidget: (context, url, error) => Container(color: Colors.grey[300], child: const Icon(Icons.fastfood)),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(dish.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text('\$${dish.price.toStringAsFixed(2)}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 30,
                    child: ElevatedButton(
                      onPressed: () {
                        cart.addItem(dish);
                        ScaffoldMessenger.of(context).hideCurrentSnackBar();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Added ${dish.name}'), duration: const Duration(seconds: 1)),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        padding: EdgeInsets.zero,
                        backgroundColor: Colors.redAccent,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Add', style: TextStyle(fontSize: 12)),
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShopCard(Shop shop) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ShopDetailScreen(shop: shop))),
        child: Row(
          children: [
            CachedNetworkImage(
              imageUrl: shop.logoUrl ?? 'https://picsum.photos/seed/${shop.id}/120/120',
              height: 100,
              width: 100,
              fit: BoxFit.cover,
              errorWidget: (context, url, error) => Container(color: Colors.grey[300], child: const Icon(Icons.store)),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(shop.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(shop.address, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                    const SizedBox(height: 8),
                    const Row(
                      children: [
                        Icon(Icons.star, size: 16, color: Colors.amber),
                        Text(' 4.8 ', style: TextStyle(fontWeight: FontWeight.bold)),
                        Text('(500+)', style: TextStyle(color: Colors.grey, fontSize: 12)),
                      ],
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
