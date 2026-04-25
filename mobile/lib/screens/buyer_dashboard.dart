import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../core/api_client.dart';
import '../models/models.dart';
import '../providers/cart_provider.dart';
import 'shop_detail_screen.dart';
import 'dish_detail_screen.dart';

class BuyerDashboard extends StatefulWidget {
  const BuyerDashboard({super.key});

  @override
  State<BuyerDashboard> createState() => _BuyerDashboardState();
}

class _BuyerDashboardState extends State<BuyerDashboard> {
  final ApiClient _apiClient = ApiClient();
  List<Shop> _shops = [];
  List<FoodItem> _dishes = [];
  List<dynamic> _categories = [];
  String? _selectedCategoryId;
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
      final catsRes = await _apiClient.get('/public/categories');
      
      if (mounted) {
        if (shopsRes.statusCode == 200) {
          final List<dynamic> shopData = jsonDecode(shopsRes.body);
          _shops = shopData.map((s) => Shop.fromJson(s)).toList();
        }
        if (dishesRes.statusCode == 200) {
          final List<dynamic> dishData = jsonDecode(dishesRes.body);
          _dishes = dishData.map((d) => FoodItem.fromJson(d)).toList();
        }
        if (catsRes.statusCode == 200) {
          _categories = jsonDecode(catsRes.body);
        }
        
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching marketplace: $e');
      if (mounted) setState(() { _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);
    final primaryColor = Theme.of(context).primaryColor;

    final categories = _categories;
    final dishes = _dishes;
    final shops = _shops;

    return Scaffold(
      backgroundColor: Colors.white,
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _fetchData,
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Search flavors, cuisines, places...',
                        prefixIcon: Icon(Icons.search, color: primaryColor),
                        filled: true,
                        fillColor: Colors.grey[100],
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ),

                if (categories.isNotEmpty) SliverToBoxAdapter(
                  child: SizedBox(
                    height: 50,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      scrollDirection: Axis.horizontal,
                      itemCount: categories.length + 1,
                      itemBuilder: (ctx, i) {
                        if (i == 0) {
                          return _buildCategoryChip('All', null, primaryColor);
                        }
                        final cat = categories[i - 1];
                        return _buildCategoryChip(cat['name'], cat['id'], primaryColor);
                      },
                    ),
                  ),
                ),
                
                if (dishes.isNotEmpty) SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                        child: Text('Curated For You', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.grey[900])),
                      ),
                      SizedBox(
                        height: 200, // Reduced height since button is gone
                        child: ListView.builder(
                          padding: const EdgeInsets.only(left: 20),
                          scrollDirection: Axis.horizontal,
                          itemCount: dishes.length,
                          itemBuilder: (ctx, i) => _buildCarouselDishCard(dishes[i], primaryColor),
                        ),
                      ),
                    ],
                  ),
                ),

                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 32, 20, 16),
                  sliver: SliverToBoxAdapter(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Explore Restaurants', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.grey[900])),
                        Icon(Icons.tune, color: primaryColor),
                      ],
                    ),
                  ),
                ),

                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (ctx, i) => Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: _buildShopCard(shops[i], primaryColor),
                    ),
                    childCount: shops.length,
                  ),
                ),
                const SliverPadding(padding: EdgeInsets.only(bottom: 32)),
              ],
            ),
          ),
    );
  }

  Widget _buildCategoryChip(String label, String? id, Color color) {
    final isSelected = _selectedCategoryId == id;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (val) => setState(() => _selectedCategoryId = id),
        selectedColor: color.withOpacity(0.2),
        labelStyle: TextStyle(
          color: isSelected ? color : Colors.grey[700],
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide(color: isSelected ? color : Colors.grey[300]!),
        showCheckmark: false,
      ),
    );
  }

  // Updated: Cleaner card without button for "Curated For You"
  Widget _buildCarouselDishCard(FoodItem dish, Color color) {
    return Container(
      width: 170,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 5))],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => DishDetailScreen(dish: dish))),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Hero(
              tag: 'dish-${dish.id}',
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: CachedNetworkImage(
                  imageUrl: dish.imageUrl ?? 'https://picsum.photos/seed/${dish.id}/200/150',
                  height: 110,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(dish.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 4),
                  Text('\$${dish.price.toStringAsFixed(2)}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.w900, fontSize: 16)),
                  Text('Discovery Special', style: TextStyle(color: Colors.grey[500], fontSize: 11)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShopCard(Shop shop, Color color) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: Colors.grey[200]!)),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ShopDetailScreen(shop: shop))),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: CachedNetworkImage(
                  imageUrl: shop.logoUrl ?? 'https://picsum.photos/seed/${shop.id}/120/120',
                  height: 90,
                  width: 90,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(shop.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    Text(shop.address, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(8)),
                          child: const Row(
                            children: [
                              Icon(Icons.star, size: 14, color: Colors.green),
                              Text(' 4.8', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text('25-35 min', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                      ],
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
