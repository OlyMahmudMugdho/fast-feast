'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, message, Card, Space } from 'antd';
import api from '@/lib/api';

const { Title, Text } = Typography;

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my-orders');
        setOrders(response.data);
      } catch (error) {
        message.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const columns = [
    { 
      title: 'Order Date', 
      dataIndex: 'created_at', 
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    { 
      title: 'Total Amount', 
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
        <Space direction="vertical" size={0}>
          {items.map((i, idx) => (
            <Text key={idx} type="secondary">
              {i.quantity}x {i.food_item.name}
            </Text>
          ))}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>My Orders</Title>
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table 
          dataSource={orders} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          locale={{ emptyText: "You haven't placed any orders yet." }}
        />
      </Card>
    </div>
  );
}
