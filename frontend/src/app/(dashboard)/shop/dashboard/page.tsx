'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Button, message, Space, Select, Alert, Spin } from 'antd';
import { ShoppingOutlined, DollarOutlined, TeamOutlined, CreditCardOutlined, RocketOutlined, SettingOutlined, SyncOutlined, CheckCircleOutlined, WarningOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function ShopDashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, staff: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const [ordersRes, empRes, shopRes, stripeRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/shops/me/employees'),
        api.get('/shops/me'),
        api.get('/payments/v2/accounts/status')
      ]);
      
      setRecentOrders(ordersRes.data);
      setShop(shopRes.data);
      setStripeStatus(stripeRes.data);
      
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

  const handleStripeAction = async () => {
    setStripeLoading(true);
    try {
      if (!shop?.stripe_account_id) {
        await api.post('/payments/v2/accounts');
      }
      const res = await api.post('/payments/v2/onboard-link');
      window.location.href = res.data.url;
    } catch (error) {
      message.error('Failed to start Stripe action');
    } finally {
      setStripeLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await api.post('/payments/v2/portal');
      window.location.href = res.data.url;
    } catch (error: any) {
      try {
        const subRes = await api.post('/payments/v2/subscribe');
        window.location.href = subRes.data.url;
      } catch (err) {
        message.error('Subscription management unavailable');
      }
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

  const renderStripeAlert = () => {
    if (!stripeStatus) return null;

    if (stripeStatus.ready_to_pay) {
      return (
        <Alert
          message="Stripe Payments Active"
          description="Your shop is fully verified and ready to accept card payments."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      );
    }

    const status = stripeStatus.details?.capability_status;

    if (status === 'restricted') {
      return (
        <Alert
          message="Account Restricted"
          description="Stripe is reviewing your information. You may need to provide additional details to enable payments."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          action={
            <Button size="small" type="primary" onClick={handleStripeAction}>
              Complete Requirements
            </Button>
          }
        />
      );
    }

    if (status === 'pending') {
      return (
        <Alert
          message="Status: Pending"
          description="Stripe is currently processing your onboarding information. This usually takes a few minutes."
          type="info"
          showIcon
          icon={<ClockCircleOutlined />}
          action={
            <Button size="small" icon={<SyncOutlined spin={stripeLoading} />} onClick={fetchShopData}>
              Check Again
            </Button>
          }
        />
      );
    }

    return (
      <Alert
        message="Onboarding Incomplete"
        description="To receive direct payouts and process card payments, you need to complete your Stripe onboarding."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        action={
          <Button size="small" type="primary" loading={stripeLoading} onClick={handleStripeAction}>
            Start Onboarding
          </Button>
        }
      />
    );
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
        <Space>
           <Button icon={<SyncOutlined />} onClick={fetchShopData}>Refresh Status</Button>
           <Button icon={<SettingOutlined />} onClick={handleManageSubscription}>Billing Portal</Button>
           <Button type="primary" icon={<RocketOutlined />} onClick={handleManageSubscription}>Boost Visibility</Button>
        </Space>
      </div>

      <div style={{ marginBottom: 24 }}>
        {renderStripeAlert()}
      </div>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
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
