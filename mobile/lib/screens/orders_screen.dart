import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/api_client.dart';
import '../models/models.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final ApiClient _apiClient = ApiClient();
  List<Order> _orders = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    if (!mounted) return;
    setState(() { 
      _isLoading = true; 
      _error = null;
    });

    try {
      final response = await _apiClient.get('/orders/my-orders');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        if (mounted) {
          setState(() {
            _orders = data.map((o) => Order.fromJson(o)).toList();
            _isLoading = false;
          });
        }
      } else {
        if (mounted) setState(() { _error = 'Failed to load orders'; _isLoading = false; });
      }
    } catch (e) {
      debugPrint('Error fetching orders: $e');
      if (mounted) setState(() { _error = 'Connection error'; _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Order Journey'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetchOrders),
        ],
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
          ? Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(_error!),
                TextButton(onPressed: _fetchOrders, child: const Text('Retry')),
              ],
            ))
          : _orders.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.receipt_outlined, size: 64, color: Colors.grey[300]),
                    const SizedBox(height: 16),
                    const Text('No orders yet', style: TextStyle(fontSize: 18, color: Colors.grey)),
                  ],
                ),
              )
            : RefreshIndicator(
                onRefresh: _fetchOrders,
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _orders.length,
                  itemBuilder: (ctx, i) {
                    final order = _orders[i];
                    return _buildOrderCard(order);
                  },
                ),
              ),
    );
  }

  Widget _buildOrderCard(Order order) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey[200]!),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.withOpacity(0.1), 
                    shape: BoxShape.circle, // Fixed typo: BoxScheme -> BoxShape
                  ),
                  child: const Icon(Icons.delivery_dining, color: Colors.redAccent),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Order #${order.id.substring(0, 8)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text(DateFormat('MMM dd, hh:mm a').format(order.createdAt), style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                    ],
                  ),
                ),
                _buildStatusTag(order.status),
              ],
            ),
            const Divider(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Payment Method', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    Text(order.paymentMethod, style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('Total Amount', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    Text('\$${order.totalAmount.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Colors.green)),
                  ],
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildStatusTag(String status) {
    Color color = Colors.grey;
    final s = status.toUpperCase();
    if (s == 'PAID' || s == 'DELIVERED') color = Colors.green;
    else if (s == 'PENDING') color = Colors.orange;
    else if (s == 'CANCELLED') color = Colors.red;
    else if (s == 'CONFIRMED' || s == 'PREPARING' || s == 'OUT_FOR_DELIVERY') color = Colors.blue;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        s,
        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w900),
      ),
    );
  }
}
