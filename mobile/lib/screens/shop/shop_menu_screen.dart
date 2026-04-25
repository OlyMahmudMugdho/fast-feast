import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/api_client.dart';
import '../../models/models.dart';

class ShopMenuScreen extends StatefulWidget {
  const ShopMenuScreen({super.key});

  @override
  State<ShopMenuScreen> createState() => _ShopMenuScreenState();
}

class _ShopMenuScreenState extends State<ShopMenuScreen> {
  final ApiClient _apiClient = ApiClient();
  final ImagePicker _picker = ImagePicker();
  List<FoodItem> _items = [];
  List<dynamic> _categories = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final itemsRes = await _apiClient.get('/shops/me/items');
      final catsRes = await _apiClient.get('/shops/me/categories');
      
      if (mounted) {
        setState(() {
          _items = (jsonDecode(itemsRes.body) as List).map((i) => FoodItem.fromJson(i)).toList();
          _categories = jsonDecode(catsRes.body) as List;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Shop Menu Fetch Error: $e');
    }
  }

  Future<void> _deleteItem(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Item?'),
        content: const Text('Are you sure you want to remove this dish from your menu?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true), 
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final res = await _apiClient.delete('/shops/me/items/$id');
        if (res.statusCode == 200) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Item deleted')));
            _fetchData();
          }
        }
      } catch (e) {
        debugPrint('Delete Error: $e');
      }
    }
  }

  void _showDishDialog({FoodItem? existingItem}) {
    final isEditing = existingItem != null;
    final nameCtrl = TextEditingController(text: existingItem?.name);
    final descCtrl = TextEditingController(text: existingItem?.description);
    final priceCtrl = TextEditingController(text: existingItem?.price.toString());
    String? selectedCategoryId = existingItem?.categoryId ?? (_categories.isNotEmpty ? _categories[0]['id'] : null);
    XFile? selectedImage;
    bool isProcessing = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(isEditing ? 'Edit Dish' : 'Add New Dish', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 20),
                
                Center(
                  child: InkWell(
                    onTap: () async {
                      final image = await _picker.pickImage(source: ImageSource.gallery);
                      if (image != null) {
                        setModalState(() => selectedImage = image);
                      }
                    },
                    child: Container(
                      width: double.infinity,
                      height: 150,
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: selectedImage == null
                        ? (isEditing && existingItem.imageUrl != null 
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: CachedNetworkImage(imageUrl: existingItem.imageUrl!, fit: BoxFit.cover, width: double.infinity),
                              )
                            : const Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.add_a_photo, size: 40, color: Colors.grey),
                                  SizedBox(height: 8),
                                  Text('Change Dish Image', style: TextStyle(color: Colors.grey)),
                                ],
                              ))
                        : ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: FutureBuilder<Uint8List>(
                              future: selectedImage!.readAsBytes(),
                              builder: (context, snapshot) {
                                if (snapshot.hasData) return Image.memory(snapshot.data!, fit: BoxFit.cover, width: double.infinity);
                                return const Center(child: CircularProgressIndicator());
                              },
                            ),
                          ),
                    ),
                  ),
                ),
                
                const SizedBox(height: 20),
                TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Dish Name', border: OutlineInputBorder())),
                const SizedBox(height: 16),
                TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder())),
                const SizedBox(height: 16),
                TextField(controller: priceCtrl, decoration: const InputDecoration(labelText: 'Price (\$)', border: OutlineInputBorder()), keyboardType: TextInputType.number),
                const SizedBox(height: 16),
                if (_categories.isNotEmpty)
                  DropdownButtonFormField<String>(
                    value: selectedCategoryId,
                    decoration: const InputDecoration(labelText: 'Category', border: OutlineInputBorder()),
                    items: _categories.map<DropdownMenuItem<String>>((c) => DropdownMenuItem(value: c['id'], child: Text(c['name']))).toList(),
                    onChanged: (val) => selectedCategoryId = val,
                  ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.orange[800], foregroundColor: Colors.white),
                    onPressed: (isProcessing || selectedCategoryId == null) 
                      ? null 
                      : () async {
                        setModalState(() => isProcessing = true);
                        
                        try {
                          http.MultipartFile? multipartFile;
                          if (selectedImage != null) {
                            final bytes = await selectedImage!.readAsBytes();
                            multipartFile = http.MultipartFile.fromBytes('image', bytes, filename: selectedImage!.name);
                          }

                          final Map<String, String> fields = {
                            'name': nameCtrl.text,
                            'description': descCtrl.text,
                            'price': priceCtrl.text,
                            'category_id': selectedCategoryId!,
                          };

                          final res = isEditing 
                            ? await _apiClient.multipartPatch('/shops/me/items/${existingItem.id}', fields, multipartFile)
                            : await _apiClient.multipartPost('/shops/me/items', fields, multipartFile!);

                          if (res.statusCode == 200 || res.statusCode == 201) {
                            Navigator.pop(ctx);
                            _fetchData();
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(isEditing ? 'Dish updated!' : 'Dish added!')));
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: ${res.statusCode}')));
                          }
                        } catch (e) {
                          debugPrint('Process Error: $e');
                        } finally {
                          setModalState(() => isProcessing = false);
                        }
                      },
                    child: isProcessing 
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(isEditing ? 'Save Changes' : 'Create Dish', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(title: const Text('My Menu')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showDishDialog(),
        label: const Text('Add New Dish'),
        icon: const Icon(Icons.add),
        backgroundColor: Colors.orange[800],
        foregroundColor: Colors.white,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _items.isEmpty 
          ? const Center(child: Text('Your menu is empty.'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _items.length,
              itemBuilder: (ctx, i) {
                final item = _items[i];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey[200]!)),
                  child: ListTile(
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: CachedNetworkImage(
                        imageUrl: item.imageUrl ?? 'https://picsum.photos/seed/${item.id}/80/80',
                        width: 50,
                        height: 50,
                        fit: BoxFit.cover,
                        errorWidget: (context, url, error) => const Icon(Icons.fastfood, color: Colors.grey),
                      ),
                    ),
                    title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('\$${item.price.toStringAsFixed(2)}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit_outlined, size: 20), 
                          onPressed: () => _showDishDialog(existingItem: item)
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline, size: 20, color: Colors.red), 
                          onPressed: () => _deleteItem(item.id)
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
