import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final role = auth.role?.replaceAll('_', ' ') ?? 'User';

    return Scaffold(
      appBar: AppBar(title: const Text('Account Dashboard')),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 40),
              decoration: BoxDecoration(
                color: Colors.redAccent.withOpacity(0.1),
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(32),
                  bottomRight: Radius.circular(32),
                ),
              ),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 50,
                    backgroundColor: Colors.redAccent,
                    child: Icon(Icons.person, size: 60, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    role,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const Text('Member since 2026', style: TextStyle(color: Colors.grey)),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  _buildMenuTile(
                    context, 
                    'Order History', 
                    Icons.history, 
                    () => Navigator.pushNamed(context, '/orders')
                  ),
                  _buildMenuTile(
                    context, 
                    'Saved Addresses', 
                    Icons.location_on_outlined, 
                    () => Navigator.pushNamed(context, '/addresses')
                  ),
                  _buildMenuTile(
                    context, 
                    'Payment Methods', 
                    Icons.credit_card, 
                    () => Navigator.pushNamed(context, '/payments')
                  ),
                  const Divider(height: 48),
                  _buildMenuTile(
                    context, 
                    'Notifications', 
                    Icons.notifications_none, 
                    () => Navigator.pushNamed(context, '/notifications')
                  ),
                  _buildMenuTile(
                    context, 
                    'Help & Support', 
                    Icons.help_outline, 
                    () => Navigator.pushNamed(context, '/support')
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => auth.logout(),
                      icon: const Icon(Icons.logout),
                      label: const Text('Logout'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.redAccent,
                        side: const BorderSide(color: Colors.redAccent),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuTile(BuildContext context, String title, IconData icon, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Colors.redAccent),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
