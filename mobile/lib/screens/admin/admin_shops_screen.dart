import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api_client.dart';

class AdminShopsScreen extends StatefulWidget {
  const AdminShopsScreen({super.key});

  @override
  State<AdminShopsScreen> createState() => _AdminShopsScreenState();
}

class _AdminShopsScreenState extends State<AdminShopsScreen> {
  final ApiClient _apiClient = ApiClient();
  List<dynamic> _shops = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchShops();
  }

  Future<void> _fetchShops() async {
    try {
      final res = await _apiClient.get('/admin/shops');
      if (mounted) {
        setState(() {
          _shops = jsonDecode(res.body);
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Fetch Shops Error: $e');
    }
  }

  Future<void> _verifyShop(String shopId, bool approve) async {
    try {
      final res = await _apiClient.post('/admin/shops/$shopId/verify', {'is_approved': approve});
      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(approve ? 'Shop Approved' : 'Shop Rejected')));
        _fetchShops();
      }
    } catch (e) {
      debugPrint('Verify Shop Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manage Shops')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _shops.length,
            itemBuilder: (ctx, i) {
              final shop = _shops[i];
              final status = shop['status'];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  title: Text(shop['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(shop['address']),
                  trailing: status == 'PENDING' 
                    ? Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(icon: const Icon(Icons.check_circle, color: Colors.green), onPressed: () => _verifyShop(shop['id'], true)),
                          IconButton(icon: const Icon(Icons.cancel, color: Colors.red), onPressed: () => _verifyShop(shop['id'], false)),
                        ],
                      )
                    : _buildStatusTag(status),
                ),
              );
            },
          ),
    );
  }

  Widget _buildStatusTag(String status) {
    final color = status == 'APPROVED' ? Colors.green : Colors.red;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(4), border: Border.all(color: color)),
      child: Text(status, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}
