import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/cart_provider.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _addressController = TextEditingController();
  String _paymentMethod = 'STRIPE';
  bool _isPlacing = false;

  @override
  void initState() {
    super.initState();
    _addressController.text = '123 Main St, New York, NY'; // Default for demo
  }

  Future<void> _placeOrder() async {
    final cart = Provider.of<CartProvider>(context, listen: false);
    if (cart.items.isEmpty) return;

    setState(() { _isPlacing = true; });

    // In a multi-vendor app, we usually place one order per shop.
    // For this demo, we assume all items in cart are from the same shop.
    final firstItem = cart.items.values.first;
    final shopId = firstItem.item.shopId;

    final checkoutUrl = await cart.placeOrder(
      _addressController.text,
      shopId,
      paymentMethod: _paymentMethod,
    );

    setState(() { _isPlacing = false; });

    if (mounted) {
      if (_paymentMethod == 'STRIPE' && checkoutUrl != null) {
        final uri = Uri.parse(checkoutUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Redirecting to Stripe...')),
            );
            Navigator.pop(context);
            Navigator.pushNamed(context, '/orders');
          }
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Could not open Stripe checkout.')),
            );
          }
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order placed successfully!')),
        );
        Navigator.pop(context);
        Navigator.pushNamed(context, '/orders');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Your Cart')),
      body: cart.items.isEmpty
          ? const Center(child: Text('Your cart is empty', style: TextStyle(fontSize: 18)))
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: cart.items.length,
                    itemBuilder: (ctx, i) {
                      final cartItem = cart.items.values.toList()[i];
                      return ListTile(
                        title: Text(cartItem.item.name),
                        subtitle: Text('${cartItem.quantity} x \$${cartItem.item.price}'),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => cart.removeItem(cartItem.item.id),
                        ),
                      );
                    },
                  ),
                ),
                Card(
                  margin: const EdgeInsets.all(16),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Total Amount', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                            Text('\$${cart.totalAmount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 20, color: Colors.green, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const Divider(height: 32),
                        TextField(
                          controller: _addressController,
                          decoration: const InputDecoration(labelText: 'Delivery Address', border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: _paymentMethod,
                          decoration: const InputDecoration(labelText: 'Payment Method', border: OutlineInputBorder()),
                          items: const [
                            DropdownMenuItem(value: 'STRIPE', child: Text('Credit Card (Stripe)')),
                            DropdownMenuItem(value: 'COD', child: Text('Cash on Delivery')),
                          ],
                          onChanged: (val) => setState(() { _paymentMethod = val!; }),
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            onPressed: _isPlacing ? null : _placeOrder,
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
                            child: _isPlacing 
                              ? const CircularProgressIndicator(color: Colors.white)
                              : const Text('Place Order', style: TextStyle(fontSize: 18)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
