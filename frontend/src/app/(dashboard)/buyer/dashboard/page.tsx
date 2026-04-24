'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Input, Space, Button, message, Empty, Spin } from 'antd';
import { SearchOutlined, ShopOutlined, ArrowRightOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function BuyerDashboard() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await api.get('/shops');
      setShops(response.data);
    } catch (error) {
      message.error('Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filteredShops = shops.filter((shop: any) => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <Title level={2}>What are you craving today?</Title>
        <Input 
          prefix={<SearchOutlined />} 
          placeholder="Search for restaurants or cuisines..." 
          size="large"
          style={{ maxWidth: 600, borderRadius: 25 }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
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
                      background: shop.logo_url ? `url(${shop.logo_url}) center/cover` : 'linear-gradient(45deg, #ff4d4f 0%, #ff7875 100%)',
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
                    avatar={<ShopOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />}
                    title={shop.name} 
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">{shop.address}</Text>
                        <Tag color="orange" style={{ marginTop: 8 }}>Free Delivery</Tag>
                      </Space>
                    } 
                  />
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Empty description="No shops found matching your search" />
            </Col>
          )}
        </Row>
      )}
    </div>
  );
}

// Add Tag import since it was missing in the thought process but used in code
import { Tag } from 'antd';
