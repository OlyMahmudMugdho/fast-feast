import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'screens/login_screen.dart';
import 'screens/main_navigation_shell.dart';
import 'screens/cart_screen.dart';
import 'screens/landing_screen.dart';
import 'screens/register_buyer_screen.dart';
import 'screens/register_shop_screen.dart';
import 'screens/address_screen.dart';
import 'screens/payment_methods_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/support_screen.dart';

void main() {
  runApp(const FastFeastApp());
}

class FastFeastApp extends StatelessWidget {
  const FastFeastApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: MaterialApp(
        title: 'Fast-Feast',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.redAccent,
            primary: Colors.redAccent,
            secondary: Colors.orangeAccent,
          ),
          appBarTheme: const AppBarTheme(
            centerTitle: true,
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.transparent,
            titleTextStyle: TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold),
          ),
          cardTheme: CardThemeData(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          navigationBarTheme: NavigationBarThemeData(
            indicatorColor: Colors.redAccent.withOpacity(0.1),
            labelTextStyle: WidgetStateProperty.all(
              const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)
            ),
          ),
        ),
        home: const AuthWrapper(),
        routes: {
          '/landing': (ctx) => const LandingScreen(),
          '/login': (ctx) => const LoginScreen(),
          '/register-buyer': (ctx) => const RegisterBuyerScreen(),
          '/register-shop': (ctx) => const RegisterShopScreen(),
          '/home': (ctx) => const MainNavigationShell(),
          '/cart': (ctx) => const CartScreen(),
          '/addresses': (ctx) => const AddressScreen(),
          '/payments': (ctx) => const PaymentMethodsScreen(),
          '/notifications': (ctx) => const NotificationsScreen(),
          '/support': (ctx) => const SupportScreen(),
        },
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    if (auth.isAuthenticated) {
      return const MainNavigationShell();
    }
    return const LandingScreen();
  }
}
