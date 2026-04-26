import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _handleLogout(BuildContext context) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final cart = Provider.of<CartProvider>(context, listen: false);
    
    // Navigate first, then clear state
    Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    
    await auth.logout();
    cart.reset();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    
    if (!auth.isAuthenticated) {
      return _buildGuestView(context);
    }

    final role = auth.role?.replaceAll('_', ' ') ?? 'Fast-Feast Member';

    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 40),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.08),
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(40),
                  bottomRight: Radius.circular(40),
                ),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: Theme.of(context).primaryColor,
                    child: const Icon(Icons.person_rounded, size: 60, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    role,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
                  ),
                  const Text('Platform Ecosystem Member', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  _buildMenuTile(context, 'Order Journey', Icons.receipt_long_rounded, () => Navigator.pushNamed(context, '/orders')),
                  _buildMenuTile(context, 'Saved Locations', Icons.map_rounded, () => Navigator.pushNamed(context, '/addresses')),
                  _buildMenuTile(context, 'Payment Gateway', Icons.account_balance_wallet_rounded, () => Navigator.pushNamed(context, '/payments')),
                  const Divider(height: 50, thickness: 1),
                  _buildMenuTile(context, 'Hub Notifications', Icons.notifications_active_rounded, () => Navigator.pushNamed(context, '/notifications')),
                  _buildMenuTile(context, 'Knowledge Base', Icons.help_center_rounded, () => Navigator.pushNamed(context, '/support')),
                  const SizedBox(height: 40),
                  
                  Material(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(16),
                    child: InkWell(
                      onTap: () => _handleLogout(context),
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        width: double.infinity,
                        height: 56,
                        alignment: Alignment.center,
                        child: const Text(
                          'LOGOUT', 
                          style: TextStyle(color: Colors.red, fontWeight: FontWeight.w900, letterSpacing: 2),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text('FAST-FEAST ENTERPRISE v1.0', style: TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 2)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGuestView(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.only(top: 80, bottom: 40, left: 32, right: 32),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(40),
                  bottomRight: Radius.circular(40),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 20,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.redAccent.withOpacity(0.05),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.redAccent.withOpacity(0.1), width: 2),
                    ),
                    child: const Icon(Icons.person_outline_rounded, size: 80, color: Colors.redAccent),
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'Join Fast Feast',
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFF1A1A1A), letterSpacing: -1),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Sign in to unlock the full experience and enjoy seamless food delivery.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16, color: Colors.grey, height: 1.5),
                  ),
                  const SizedBox(height: 40),
                  SizedBox(
                    width: double.infinity,
                    height: 58,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pushNamed(context, '/login'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                        elevation: 8,
                        shadowColor: Colors.redAccent.withOpacity(0.4),
                      ),
                      child: const Text('Login or Create Account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(32),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                const Text(
                  'Exclusive Benefits',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A)),
                ),
                const SizedBox(height: 20),
                _buildBenefitCard(
                  context,
                  'Real-time Tracking',
                  'Watch your food arrive with live GPS tracking from kitchen to your door.',
                  Icons.map_outlined,
                  Colors.blue,
                ),
                _buildBenefitCard(
                  context,
                  'Seamless Payments',
                  'Save your preferred payment methods for a faster, one-click checkout.',
                  Icons.payment_outlined,
                  Colors.green,
                ),
                _buildBenefitCard(
                  context,
                  'Order History',
                  'Easily reorder your favorite meals with just a single tap.',
                  Icons.history_rounded,
                  Colors.orange,
                ),
                const SizedBox(height: 32),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/home'),
                    child: Text(
                      'Continue Browsing as Guest',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 40),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBenefitCard(BuildContext context, String title, String description, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A)),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(fontSize: 14, color: Colors.grey[600], height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuTile(BuildContext context, String title, IconData icon, VoidCallback onTap) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: Theme.of(context).primaryColor.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, color: Theme.of(context).primaryColor, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey),
      onTap: onTap,
    );
  }
}
