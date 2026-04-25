'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Input, Space, Button, message, Empty, Spin, Tag, Tabs, Avatar } from 'antd';
import { SearchOutlined, ShopOutlined, ArrowRightOutlined, PlusOutlined, FireOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';

const { Title, Text, Paragraph } = Typography;

export default function BuyerDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const { addToCart } = useCart();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, shopsRes, catsRes] = await Promise.all([
        api.get('/public/items'),
        api.get('/public/shops'),
        api.get('/public/categories')
      ]);
      setItems(itemsRes.data);
      setShops(shopsRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      message.error('Failed to fetch marketplace data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = items.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredShops = shops.filter((shop: any) => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <Title level={2}>Marketplace</Title>
        <Paragraph type="secondary">Discover delicious food from multiple vendors</Paragraph>
        <Input 
          prefix={<SearchOutlined />} 
          placeholder="Search for dishes, restaurants or cuisines..." 
          size="large"
          style={{ maxWidth: 600, borderRadius: 25, marginTop: 16 }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        centered
        items={[
          {
            key: '1',
            label: <span><FireOutlined /> All Foods</span>,
            children: (
              loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
              ) : (
                <Row gutter={[24, 24]}>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item: any) => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                        <Card 
                          hoverable 
                          cover={
                            <div style={{ 
                              height: 180, 
                              backgroundImage: `url(${item.image_url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              borderRadius: '8px 8px 0 0'
                            }} />
                          }
                          style={{ borderRadius: 12, overflow: 'hidden' }}
                          actions={[
                            <Button 
                              type="primary" 
                              icon={<PlusOutlined />} 
                              onClick={() => addToCart(item)}
                              shape="round"
                            >
                              Add
                            </Button>,
                            <Link href={`/buyer/item?id=${item.id}`} key="view">
                              <Button type="link">Details</Button>
                            </Link>
                          ]}
                        >
                          <Card.Meta 
                            title={item.name} 
                            description={
                              <Space direction="vertical" size={0}>
                                <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>${item.price}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                   <ShopOutlined /> {shops.find(s => s.id === item.shop_id)?.name || 'Store'}
                                </Text>
                              </Space>
                            } 
                          />
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col span={24}><Empty description="No food items found" /></Col>
                  )}
                </Row>
              )
            )
          },
          {
            key: '2',
            label: <span><ShopOutlined /> Restaurants</span>,
            children: (
              loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
              ) : (
                <Row gutter={[24, 24]}>
                  {filteredShops.length > 0 ? (
                    filteredShops.map((shop: any) => (
                      <Col xs={24} sm={12} lg={8} key={shop.id}>
                        <Card 
                          hoverable 
                          cover={
                            <div style={{ 
                              height: 180, 
                              backgroundImage: `url(${shop.logo_url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              borderRadius: '8px 8px 0 0'
                            }} />
                          }
                          actions={[
                            <Link href={`/buyer/shop?id=${shop.id}`} key="view">
                              <Button type="link" icon={<ArrowRightOutlined />}>View Menu</Button>
                            </Link>
                          ]}
                          style={{ borderRadius: 12, overflow: 'hidden' }}
                        >
                          <Card.Meta 
                            avatar={<Avatar icon={<ShopOutlined />} style={{ backgroundColor: '#ff4d4f' }} />}
                            title={shop.name} 
                            description={shop.address} 
                          />
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col span={24}><Empty description="No restaurants found" /></Col>
                  )}
                </Row>
              )
            )
          }
        ]}
      />
    </div>
  );
}
