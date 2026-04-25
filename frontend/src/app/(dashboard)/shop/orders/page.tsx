'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Select, message, Space, Button, Badge, Divider } from 'antd';
import { ShoppingOutlined, UserOutlined, ClockCircleOutlined, SyncOutlined, EnvironmentOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ShopOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (error) {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      message.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns = [
    {
      title: 'Order Details',
      key: 'details',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>#{record.id.slice(0, 8)}</Text>
          <Text type="secondary">
            <ClockCircleOutlined /> {new Date(record.created_at).toLocaleString()}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Customer & Address',
      key: 'customer',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text><UserOutlined /> {record.buyer_name || 'Customer'}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <EnvironmentOutlined /> {record.delivery_address}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Items',
      key: 'items',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          {record.items.map((item: any, idx: number) => (
            <Text key={idx} style={{ fontSize: '13px' }}>
              {item.quantity}x {item.food_item.name}
            </Text>
          ))}
        </Space>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total',
      render: (amt: string) => <Text strong>${amt}</Text>,
    },
    {
      title: 'Payment',
      key: 'payment',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Tag color={record.payment_method === 'STRIPE' ? 'blue' : 'cyan'}>
            {record.payment_method}
          </Tag>
          {record.status === 'PAID' && <Text type="success" style={{ fontSize: '10px' }}>SECURED</Text>}
        </Space>
      ),
    },
    {
      title: 'Current Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: any = {
          'PENDING': 'gold',
          'PAID': 'green',
          'CONFIRMED': 'blue',
          'PREPARING': 'orange',
          'OUT_FOR_DELIVERY': 'purple',
          'DELIVERED': 'success',
          'CANCELLED': 'red'
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Manage',
      key: 'action',
      render: (_: any, record: any) => (
        <Select 
          defaultValue={record.status} 
          style={{ width: 160 }} 
          onChange={(val) => handleStatusChange(record.id, val)}
          disabled={record.status === 'DELIVERED' || record.status === 'CANCELLED'}
        >
          <Option value="CONFIRMED">Confirm Order</Option>
          <Option value="PREPARING">Preparing</Option>
          <Option value="OUT_FOR_DELIVERY">Out for Delivery</Option>
          <Option value="DELIVERED">Delivered</Option>
          <Option value="CANCELLED">Cancel</Option>
        </Select>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space direction="vertical" size={0}>
          <Title level={2}>Manage Orders</Title>
          <Text type="secondary">Track and fulfill your incoming customer orders</Text>
        </Space>
        <Button icon={<SyncOutlined />} onClick={fetchOrders}>Refresh List</Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table 
          columns={columns} 
          dataSource={orders} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
