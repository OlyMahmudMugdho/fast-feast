class Shop {
  final String id;
  final String name;
  final String address;
  final String? logoUrl;

  Shop({required this.id, required this.name, required this.address, this.logoUrl});

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      id: json['id'],
      name: json['name'],
      address: json['address'],
      logoUrl: json['logo_url'],
    );
  }
}

class FoodItem {
  final String id;
  final String name;
  final String description;
  final double price;
  final String? imageUrl;
  final String shopId;

  FoodItem({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.imageUrl,
    required this.shopId,
  });

  factory FoodItem.fromJson(Map<String, dynamic> json) {
    return FoodItem(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: double.parse(json['price'].toString()),
      imageUrl: json['image_url'],
      shopId: json['shop_id'],
    );
  }
}

class CartItem {
  final FoodItem item;
  int quantity;

  CartItem({required this.item, this.quantity = 1});
}

class Order {
  final String id;
  final double totalAmount;
  final String status;
  final String paymentMethod;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.totalAmount,
    required this.status,
    required this.paymentMethod,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      totalAmount: double.parse(json['total_amount'].toString()),
      status: json['status'],
      paymentMethod: json['payment_method'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
