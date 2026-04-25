import 'package:flutter/material.dart';

class SupportScreen extends StatelessWidget {
  const SupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Help & Support')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Common Questions', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _buildFAQ('How do I track my order?', 'You can track your order in the "Orders" tab of the navigation bar.'),
            _buildFAQ('Can I cancel my order?', 'Orders can be cancelled until the restaurant starts preparing your food.'),
            _buildFAQ('What is Fast-Feast Wallet?', 'Our internal wallet for faster checkouts and easy refunds.'),
            const SizedBox(height: 40),
            const Text('Still need help?', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Card(
              color: Colors.redAccent.withOpacity(0.05),
              child: const ListTile(
                leading: Icon(Icons.email, color: Colors.redAccent),
                title: Text('Email Support'),
                subtitle: Text('support@fastfeast.com'),
                trailing: Icon(Icons.chevron_right),
              ),
            ),
            const Card(
              child: ListTile(
                leading: Icon(Icons.phone, color: Colors.green),
                title: Text('Call Hotline'),
                subtitle: Text('+1-800-FEAST-NOW'),
                trailing: Icon(Icons.chevron_right),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQ(String q, String a) {
    return ExpansionTile(
      title: Text(q, style: const TextStyle(fontWeight: FontWeight.w500)),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Text(a, style: const TextStyle(color: Colors.grey)),
        )
      ],
    );
  }
}
