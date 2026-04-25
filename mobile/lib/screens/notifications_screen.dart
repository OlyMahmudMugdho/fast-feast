import 'package:flutter/material.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _pushEnabled = true;
  bool _orderUpdates = true;
  bool _promoUpdates = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSwitchTile('Master Notification Switch', 'Turn all notifications on/off', _pushEnabled, (val) => setState(() => _pushEnabled = val)),
          const Divider(height: 32),
          _buildSwitchTile('Order Status', 'Get updates on your active orders', _orderUpdates, (val) => setState(() => _orderUpdates = val)),
          _buildSwitchTile('Promotions', 'Get notified about discounts and offers', _promoUpdates, (val) => setState(() => _promoUpdates = val)),
          _buildSwitchTile('Email Newsletter', 'Weekly digests and platform updates', true, (val) {}),
        ],
      ),
    );
  }

  Widget _buildSwitchTile(String title, String subtitle, bool value, Function(bool) onChanged) {
    return SwitchListTile(
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(subtitle),
      value: value,
      onChanged: onChanged,
      activeColor: Colors.redAccent,
    );
  }
}
