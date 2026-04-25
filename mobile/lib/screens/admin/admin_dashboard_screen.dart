import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api_client.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final ApiClient _apiClient = ApiClient();
  Map<String, dynamic>? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    try {
      final res = await _apiClient.get('/admin/stats');
      if (mounted) {
        setState(() {
          _stats = jsonDecode(res.body);
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Admin Stats Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text('Platform Analytics')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _fetchStats,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Platform Totals', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _buildStatCard('Total Volume', '\$${_stats?['total_revenue']?.toStringAsFixed(2) ?? '0.00'}', Icons.show_chart, Colors.indigo)),
                      const SizedBox(width: 12),
                      Expanded(child: _buildStatCard('Earnings', '\$${_stats?['total_platform_fees']?.toStringAsFixed(2) ?? '0.00'}', Icons.account_balance_wallet, Colors.teal)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _buildStatCard('Total Shops', '${_stats?['total_shops'] ?? 0}', Icons.store, Colors.amber)),
                      const SizedBox(width: 12),
                      Expanded(child: _buildStatCard('Total Users', '${_stats?['total_users'] ?? 0}', Icons.people, Colors.deepPurple)),
                    ],
                  ),
                  const SizedBox(height: 40),
                  const Text('System Health', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  const Card(
                    child: ListTile(
                      leading: Icon(Icons.circle, color: Colors.green, size: 16),
                      title: Text('API Backend'),
                      trailing: Text('ONLINE', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ),
                  const Card(
                    child: ListTile(
                      leading: Icon(Icons.circle, color: Colors.green, size: 16),
                      title: Text('Stripe Connect Gateway'),
                      trailing: Text('ONLINE', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ),
                ],
              ),
            ),
          ),
    );
  }

  Widget _buildStatCard(String title, String val, IconData icon, Color color) {
    return Card(
      elevation: 0,
      color: color.withOpacity(0.05),
      // Fixed: Using 'side' instead of 'border'
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16), 
        side: BorderSide(color: color.withOpacity(0.1))
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 12),
            Text(val, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
            Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 12, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
