'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Typography, Row, Col, Card, Button, Spin, Tag, Space, Divider, message, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, ShopOutlined, AppstoreOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

function ItemDetailsContent() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get('id');
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!itemId) return;
      setLoading(true);
      try {
        // Fetch all items and find the one we need (simulating a GET /items/{id} if not exists)
        const response = await api.get('/public/items');
        const foundItem = response.data.find((i: any) => i.id === itemId);
        
        if (foundItem) {
          setItem(foundItem);
          
          // Fetch shop and category info
          const [shopsRes, catRes] = await Promise.all([
            api.get('/public/shops'),
            api.get(`/public/shops/${foundItem.shop_id}/categories`)
          ]);
          
          setShop(shopsRes.data.find((s: any) => s.id === foundItem.shop_id));
          setCategory(catRes.data.find((c: any) => c.id === foundItem.category_id));
        } else {
          message.error('Item not found');
        }
      } catch (error) {
        message.error('Failed to load item details');
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [itemId]);

  const handleAddToCart = () => {
    // In a real app, we'd use a Global Cart Context
    message.success(`${item.name} added to cart! Redirecting to shop...`);
    router.push(`/buyer/shop?id=${item.shop_id}`);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  if (!item) return <div style={{ textAlign: 'center', padding: '100px' }}><Text>Item not found</Text></div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Breadcrumb items={[
          { title: <Link href="/buyer/dashboard">Shops</Link> },
          { title: <Link href={`/buyer/shop?id=${item.shop_id}`}>{shop?.name || 'Shop'}</Link> },
          { title: item.name }
        ]} />

        <Row gutter={[48, 48]}>
          <Col xs={24} md={12}>
            <Card 
              cover={
                <img 
                  alt={item.name} 
                  src={item.image_url} 
                  style={{ width: '100%', borderRadius: 12, objectFit: 'cover', height: 400 }} 
                />
              }
              bordered={false}
              bodyStyle={{ padding: 0 }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Tag color="volcano">{category?.name || 'Category'}</Tag>
                <Title style={{ marginTop: 12, marginBottom: 0 }}>{item.name}</Title>
                <Text type="secondary" style={{ fontSize: 16 }}>From {shop?.name}</Text>
              </div>

              <Title level={2} style={{ color: '#ff4d4f', margin: 0 }}>${item.price}</Title>
              
              <Divider />
              
              <div>
                <Title level={4}>Description</Title>
                <Paragraph style={{ fontSize: 16, lineHeight: '1.8' }}>
                  {item.description}
                </Paragraph>
              </div>

              <Space direction="vertical" size="small">
                <Space><ShopOutlined /> <Text>Verified Vendor: {shop?.name}</Text></Space>
                <Space><AppstoreOutlined /> <Text>Category: {category?.name}</Text></Space>
              </Space>

              <div style={{ marginTop: 32 }}>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ShoppingCartOutlined />} 
                  block 
                  style={{ height: 50, borderRadius: 25, fontSize: 18 }}
                  onClick={handleAddToCart}
                >
                  Order This Item
                </Button>
                <Link href={`/buyer/shop?id=${item.shop_id}`}>
                  <Button type="link" block style={{ marginTop: 12 }}>View Full Menu</Button>
                </Link>
              </div>
            </Space>
          </Col>
        </Row>
      </Space>
    </div>
  );
}

export default function ItemDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ItemDetailsContent />
    </Suspense>
  );
}
