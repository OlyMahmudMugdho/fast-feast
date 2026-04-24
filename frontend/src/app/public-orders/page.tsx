'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Tag, message, Card, Button } from 'antd';
import { ArrowLeftOutlined, ShoppingOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import Link from 'next/link';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function PublicOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/public/orders');
        setOrders(response.data);
      } catch (error) {
        message.error('Failed to fetch public orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const columns = [
    { 
      title: 'Date', 
      dataIndex: 'created_at', 
      key: 'date',
      render: (date: string) => new Date(date).toLocaleString()
    },
    { 
      title: 'Shop', 
      dataIndex: 'shop_id', 
      key: 'shop',
      render: (id: string) => `Shop ${id.slice(0, 4)}`
    },
    { 
      title: 'Amount', 
      dataIndex: 'total_amount', 
      key: 'amount',
      render: (amt: string) => `$${amt}`
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        if (status === 'DELIVERED') color = 'green';
        if (status === 'CANCELLED') color = 'red';
        if (status === 'PREPARING') color = 'blue';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <Text type="secondary">
          {items.map(i => `${i.quantity}x ${i.food_item.name}`).join(', ')}
        </Text>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', padding: '0 50px' }}>
        <Link href="/">
          <Button icon={<ArrowLeftOutlined />} type="text">Back to Home</Button>
        </Link>
        <Title level={3} style={{ margin: '0 0 0 20px', color: '#ff4d4f' }}>Fast-Feast Public Feed</Title>
      </Header>
      
      <Content style={{ padding: '50px' }}>
        <Card title={<Space><ShoppingOutlined /> Latest Activity</Space>} bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Table 
            dataSource={orders} 
            columns={columns} 
            rowKey="id" 
            loading={loading}
            locale={{ emptyText: "No orders placed yet." }}
          />
        </Card>
      </Content>
    </Layout>
  );
}

import { Space } from 'antd';
