import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_client.dart';

class AuthProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  String? _token;
  String? _role;
  bool _isLoading = false;

  String? get token => _token;
  String? get role => _role;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;

  AuthProvider() {
    _loadAuthData();
  }

  Future<void> _loadAuthData() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _role = prefs.getString('role');
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.post('/auth/login', {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['access_token'];
        _role = data['role'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);
        await prefs.setString('role', _role!);
        
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Login error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> registerBuyer(String email, String password, String fullName, String phone) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiClient.post('/auth/register/buyer', {
        'email': email,
        'password': password,
        'full_name': fullName,
        'phone': phone,
      });
      _isLoading = false;
      notifyListeners();
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> registerShop(String email, String password, String ownerName, String shopName, String address) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiClient.post('/auth/register/shop', {
        'email': email,
        'password': password,
        'full_name': ownerName,
        'shop_name': shopName,
        'shop_address': address,
      });
      _isLoading = false;
      notifyListeners();
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _role = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    notifyListeners();
  }
}
