import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'buyer_dashboard.dart';
import 'orders_screen.dart';
import 'profile_screen.dart';
import 'shop/shop_dashboard_screen.dart';
import 'shop/shop_menu_screen.dart';
import 'admin/admin_dashboard_screen.dart';
import 'admin/admin_shops_screen.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _selectedIndex = 0;

  Color _getPrimaryColor(String role) {
    if (role.contains('ADMIN')) return Colors.indigo;
    if (role.contains('SHOP')) return Colors.orange[800]!;
    return Colors.redAccent;
  }

  String _getAppTitle(String role) {
    if (role.contains('ADMIN')) return 'Enterprise Control';
    if (role.contains('SHOP')) return 'Merchant Suite';
    return 'Fast-Feast';
  }

  // Pure Widget selection - Extremely defensive
  List<Widget> _getTabWidgets(String role, bool isAuthenticated) {
    try {
      if (role.contains('ADMIN')) {
        return [const AdminDashboardScreen(), const AdminShopsScreen(), const ProfileScreen()];
      } else if (role.contains('SHOP')) {
        return [const ShopDashboardScreen(), const ShopMenuScreen(), const OrdersScreen(), const ProfileScreen()];
      } else {
        return [
          const BuyerDashboard(),
          isAuthenticated ? const OrdersScreen() : const GuestPlaceholder(title: 'Orders History'),
          const ProfileScreen(),
        ];
      }
    } catch (e) {
      return [const Scaffold(body: Center(child: CircularProgressIndicator()))];
    }
  }

  List<NavigationDestination> _getDestinations(String role) {
    if (role.contains('ADMIN')) {
      return const [
        NavigationDestination(icon: Icon(Icons.analytics_outlined), selectedIcon: Icon(Icons.analytics), label: 'Analytics'),
        NavigationDestination(icon: Icon(Icons.verified_user_outlined), selectedIcon: Icon(Icons.verified_user), label: 'Verify'),
        NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
      ];
    } else if (role.contains('SHOP')) {
      return const [
        NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Stats'),
        NavigationDestination(icon: Icon(Icons.restaurant_menu), selectedIcon: Icon(Icons.restaurant), label: 'Menu'),
        NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Orders'),
        NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Account'),
      ];
    } else {
      return const [
        NavigationDestination(icon: Icon(Icons.storefront_outlined), selectedIcon: Icon(Icons.storefront), label: 'Market'),
        NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Orders'),
        NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Me'),
      ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final cart = Provider.of<CartProvider>(context);
    
    // Defensive variable extraction
    final String currentRole = auth.role ?? 'BUYER';
    final bool isAuth = auth.isAuthenticated;
    final Color primaryColor = _getPrimaryColor(currentRole);
    
    final List<NavigationDestination> destinations = _getDestinations(currentRole);
    final List<Widget> tabs = _getTabWidgets(currentRole, isAuth);

    // Guard against index mismatch
    int safeIndex = _selectedIndex;
    if (safeIndex >= tabs.length) {
      safeIndex = 0;
    }

    return Theme(
      data: Theme.of(context).copyWith(
        colorScheme: ColorScheme.fromSeed(seedColor: primaryColor, primary: primaryColor),
      ),
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          title: Text(
            _getAppTitle(currentRole), 
            style: TextStyle(color: primaryColor, fontWeight: FontWeight.w900, letterSpacing: -0.5)
          ),
          actions: [
            if (!currentRole.contains('ADMIN') && !currentRole.contains('SHOP')) IconButton(
              icon: Badge(
                label: Text('${cart.itemCount}'), 
                isLabelVisible: cart.itemCount > 0, 
                child: const Icon(Icons.shopping_cart_outlined)
              ),
              onPressed: () => Navigator.pushNamed(context, '/cart'),
            ),
            const SizedBox(width: 8),
          ],
        ),
        body: IndexedStack(
          index: safeIndex,
          children: tabs,
        ),
        bottomNavigationBar: NavigationBar(
          backgroundColor: Colors.white,
          indicatorColor: primaryColor.withOpacity(0.1),
          elevation: 10,
          selectedIndex: safeIndex,
          onDestinationSelected: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
          destinations: destinations,
        ),
      ),
    );
  }
}

class GuestPlaceholder extends StatelessWidget {
  final String title;
  const GuestPlaceholder({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.lock_person_outlined, size: 64, color: Colors.grey),
            const SizedBox(height: 24),
            Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Please login to access this feature.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/login'),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
              child: const Text('Login Now'),
            )
          ],
        ),
      ),
    );
  }
}
