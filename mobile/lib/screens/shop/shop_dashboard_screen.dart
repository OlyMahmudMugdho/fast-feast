import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api_client.dart';

class ShopDashboardScreen extends StatefulWidget {
  const ShopDashboardScreen({super.key});

  @override
  State<ShopDashboardScreen> createState() => _ShopDashboardScreenState();
}

class _ShopDashboardScreenState extends State<ShopDashboardScreen> {
  final ApiClient _apiClient = ApiClient();
  Map<String, dynamic>? _shopData;
  Map<String, dynamic>? _stripeStatus;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final shopRes = await _apiClient.get('/shops/me');
      final stripeRes = await _apiClient.get('/payments/v2/accounts/status');
      
      if (mounted) {
        setState(() {
          _shopData = jsonDecode(shopRes.body);
          _stripeStatus = jsonDecode(stripeRes.body);
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Shop Dashboard Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Shop Performance')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildStripeBanner(),
                const SizedBox(height: 24),
                const Text('Quick Stats', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _buildStatCard('Revenue', '\$1,250.00', Icons.attach_money, Colors.green)),
                    const SizedBox(width: 12),
                    Expanded(child: _buildStatCard('Orders', '48', Icons.shopping_bag, Colors.blue)),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildStatCard('Customers', '32', Icons.people, Colors.orange)),
                    const SizedBox(width: 12),
                    Expanded(child: _buildStatCard('Rating', '4.9', Icons.star, Colors.amber)),
                  ],
                ),
                const SizedBox(height: 32),
                const Text('Shop Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.store, color: Colors.redAccent),
                    title: Text(_shopData?['name'] ?? 'My Shop'),
                    subtitle: Text(_shopData?['address'] ?? 'Loading address...'),
                    trailing: const TagWidget(text: 'ACTIVE', color: Colors.green),
                  ),
                ),
              ],
            ),
          ),
    );
  }

  Widget _buildStripeBanner() {
    final isReady = _stripeStatus?['ready_to_pay'] ?? false;
    if (isReady) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.green[200]!)),
        child: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 12),
            Expanded(child: Text('Stripe Payments are Active. You will receive payouts automatically.', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold))),
          ],
        ),
      );
    }
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.orange[50], borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.orange[200]!)),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.warning, color: Colors.orange),
              const SizedBox(width: 12),
              const Expanded(child: Text('Payment setup incomplete. You cannot receive payouts yet.', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold))),
            ],
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: () {}, // Link to onboarding would go here
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange, foregroundColor: Colors.white),
            child: const Text('Complete Onboarding'),
          )
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String val, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color),
            const SizedBox(height: 8),
            Text(val, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

class TagWidget extends StatelessWidget {
  final String text;
  final Color color;
  const TagWidget({super.key, required this.text, required this.color});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(4), border: Border.all(color: color)),
      child: Text(text, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}
