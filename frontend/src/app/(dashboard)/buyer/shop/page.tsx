'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Layout, Typography, Row, Col, Card, Button, List, message, Spin, Space, Divider } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';

const { Title, Text } = Typography;

function ShopMenuContent() {
  const searchParams = useSearchParams();
  const shop_id = searchParams.get('id');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const { addToCart } = useCart();
  
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

  if (loading && shop_id) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  if (!shop_id) return <div style={{ textAlign: 'center', padding: '100px' }}><Text>No shop selected</Text></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Link href="/buyer/dashboard">
          <Button icon={<ArrowLeftOutlined />}>Back to Shops</Button>
        </Link>
      </div>
      
      <Row justify="center">
        <Col xs={24} md={20} lg={16}>
          <Title level={2}>Menu</Title>
          {categories.map((cat: any) => (
            <div key={cat.id} style={{ marginBottom: 40 }}>
              <Title level={4} style={{ color: '#ff4d4f' }}>{cat.name}</Title>
              <Divider style={{ marginTop: 8 }} />
              <Row gutter={[16, 16]}>
                {items.filter((i: any) => i.category_id === cat.id).map((item: any) => (
                  <Col span={24} key={item.id}>
                    <Card hoverable style={{ borderRadius: 12 }}>
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
