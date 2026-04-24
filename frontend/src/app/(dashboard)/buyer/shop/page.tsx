'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Layout, Typography, Row, Col, Card, Button, List, message, Spin, Space, Divider } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

function ShopMenuContent() {
  const searchParams = useSearchParams();
  const shop_id = searchParams.get('id');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchMenu = async () => {
      if (!shop_id) return;
      setLoading(true);
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get(`/public/shops/${shop_id}/categories`),
          api.get(`/public/shops/${shop_id}/items`)
        ]);
        setCategories(catRes.data);
        setItems(itemRes.data);
      } catch (error) {
        message.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [shop_id]);

  const addToCart = (item: any) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    message.success(`${item.name} added to cart`);
  };

  const removeFromCart = (itemId: string) => {
    const existing = cart.find(i => i.id === itemId);
    if (existing.quantity > 1) {
      setCart(cart.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i));
    } else {
      setCart(cart.filter(i => i.id !== itemId));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((acc, curr) => acc + (parseFloat(curr.price) * curr.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    try {
      const orderData = {
        shop_id: shop_id,
        delivery_address: "Default Address",
        items: cart.map(i => ({ food_item_id: i.id, quantity: i.quantity }))
      };
      await api.post('/orders', orderData);
      message.success('Order placed successfully!');
      setCart([]);
      router.push('/buyer/orders');
    } catch (error) {
      message.error('Failed to place order');
    }
  };

  if (loading && shop_id) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  if (!shop_id) return <div style={{ textAlign: 'center', padding: '100px' }}><Text>No shop selected</Text></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Link href="/buyer/dashboard">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 24 }}>Back to Shops</Button>
      </Link>
      
      <Row gutter={32}>
        <Col xs={24} lg={16}>
          <Title level={2}>Menu</Title>
          {categories.map((cat: any) => (
            <div key={cat.id} style={{ marginBottom: 40 }}>
              <Title level={4} style={{ color: '#ff4d4f' }}>{cat.name}</Title>
              <Divider style={{ marginTop: 8 }} />
              <Row gutter={[16, 16]}>
                {items.filter((i: any) => i.category_id === cat.id).map((item: any) => (
                  <Col span={24} key={item.id}>
                    <Card style={{ borderRadius: 12 }}>
                      <Row align="middle" gutter={16}>
                        <Col flex="100px">
                          <div style={{ 
                            width: 80, 
                            height: 80, 
                            borderRadius: 8, 
                            backgroundImage: item.image_url ? `url(${item.image_url})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundColor: '#fafafa'
                          }} />
                        </Col>
                        <Col flex="auto">
                          <Title level={5} style={{ margin: 0 }}>{item.name}</Title>
                          <Text type="secondary">{item.description}</Text>
                          <div style={{ marginTop: 8 }}>
                            <Text strong style={{ fontSize: 16 }}>${item.price}</Text>
                            <Link href={`/buyer/item?id=${item.id}`} style={{ marginLeft: 16 }}>
                              <Button type="link" size="small">Details</Button>
                            </Link>
                          </div>
                        </Col>
                        <Col>
                          <Button 
                            type="primary" 
                            shape="circle" 
                            icon={<PlusOutlined />} 
                            onClick={() => addToCart(item)}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title={<Space><ShoppingCartOutlined /> Your Cart</Space>}
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 100 }}
          >
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">Your cart is empty</Text>
              </div>
            ) : (
              <>
                <List
                  itemLayout="horizontal"
                  dataSource={cart}
                  renderItem={(item: any) => (
                    <List.Item
                      actions={[
                        <Space key="actions">
                          <Button size="small" icon={<MinusOutlined />} onClick={() => removeFromCart(item.id)} />
                          <Text>{item.quantity}</Text>
                          <Button size="small" icon={<PlusOutlined />} onClick={() => addToCart(item)} />
                        </Space>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.name}
                        description={`$${(item.price * item.quantity).toFixed(2)}`}
                      />
                    </List.Item>
                  )}
                />
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <Title level={4}>Total</Title>
                  <Title level={4} style={{ color: '#ff4d4f' }}>${calculateTotal()}</Title>
                </div>
                <Button type="primary" size="large" block onClick={handleCheckout}>
                  Checkout (CoD)
                </Button>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default function ShopMenuPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopMenuContent />
    </Suspense>
  );
}
