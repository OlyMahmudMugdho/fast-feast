import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  static const String baseUrl = 'https://fast-feast.onrender.com/api/v1';

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<http.Response> get(String endpoint) async {
    final token = await getToken();
    return http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
  }

  Future<http.Response> post(String endpoint, Map<String, dynamic> data) async {
    final token = await getToken();
    return http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    );
  }

  Future<http.StreamedResponse> multipartPost(
    String endpoint, 
    Map<String, String> fields, 
    http.MultipartFile file
  ) async {
    final token = await getToken();
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl$endpoint'));
    
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    
    request.fields.addAll(fields);
    request.files.add(file);
    
    return await request.send();
  }

  Future<http.StreamedResponse> multipartPatch(
    String endpoint, 
    Map<String, String> fields, 
    http.MultipartFile? file
  ) async {
    final token = await getToken();
    final request = http.MultipartRequest('PATCH', Uri.parse('$baseUrl$endpoint'));
    
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    
    request.fields.addAll(fields);
    if (file != null) {
      request.files.add(file);
    }
    
    return await request.send();
  }

  Future<http.Response> patch(String endpoint, Map<String, dynamic> data) async {
    final token = await getToken();
    return http.patch(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    );
  }

  // Fixed: Added missing delete method
  Future<http.Response> delete(String endpoint) async {
    final token = await getToken();
    return http.delete(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
  }
}
