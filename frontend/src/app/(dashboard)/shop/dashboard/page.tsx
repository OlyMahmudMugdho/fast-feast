'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Button, message, Space, Select } from 'antd';
import { ShoppingOutlined, DollarOutlined, TeamOutlined, CreditCardOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ShopDashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, staff: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const [ordersRes, empRes, shopRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/shops/me/employees'),
        api.get('/shops/me')
      ]);
      
      setRecentOrders(ordersRes.data);
      setShop(shopRes.data);
      
      const totalRev = ordersRes.data.reduce((acc: number, curr: any) => acc + parseFloat(curr.total_amount), 0);
      setStats({ 
        revenue: totalRev, 
        orders: ordersRes.data.length, 
        staff: empRes.data.length 
      });
    } catch (error) {
      message.error('Failed to fetch shop data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const handleOnboard = async () => {
    try {
      const response = await api.post('/orders/onboard');
      window.location.href = response.data.account_link_url;
    } catch (error) {
      message.error('Failed to start onboarding');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      message.success('Order status updated');
      fetchShopData();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id', render: (id: string) => id.slice(0, 8) },
    { title: 'Amount', dataIndex: 'total_amount', key: 'amount', render: (amt: string) => `$${amt}` },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        if (status === 'PAID') color = 'green';
        if (status === 'DELIVERED') color = 'blue';
        if (status === 'CANCELLED') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    { 
      title: 'Action', 
      key: 'action',
      render: (_: any, record: any) => (
        <Select 
          defaultValue={record.status} 
          style={{ width: 150 }} 
          onChange={(val) => handleStatusChange(record.id, val)}
        >
          <Option value="PENDING">PENDING</Option>
          <Option value="PAID">PAID</Option>
          <Option value="CONFIRMED">CONFIRMED</Option>
          <Option value="PREPARING">PREPARING</Option>
          <Option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</Option>
          <Option value="DELIVERED">DELIVERED</Option>
          <Option value="CANCELLED">CANCELLED</Option>
        </Select>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Shop Overview</Title>
        {!shop?.stripe_onboarded ? (
          <Button 
            type="primary" 
            icon={<CreditCardOutlined />} 
            onClick={handleOnboard}
            style={{ background: '#635bff', borderColor: '#635bff' }}
          >
            Finish Stripe Setup
          </Button>
        ) : (
          <Tag color="success" style={{ padding: '4px 12px' }}>Stripe Onboarded</Tag>
        )}
      </div>
      
      <Row gutter={16} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Total Revenue" value={stats.revenue} precision={2} prefix={<DollarOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Total Orders" value={stats.orders} prefix={<ShoppingOutlined />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Staff Members" value={stats.staff} prefix={<TeamOutlined />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Orders" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table 
          columns={columns} 
          dataSource={recentOrders} 
          rowKey="id" 
          loading={loading}
        />
      </Card>
    </div>
  );
}
