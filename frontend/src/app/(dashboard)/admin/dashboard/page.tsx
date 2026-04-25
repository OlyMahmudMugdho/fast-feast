'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Button, message, Space, Tag, Spin, Divider, Badge } from 'antd';
import { ShopOutlined, UserOutlined, ShoppingOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, TransactionOutlined, HistoryOutlined, MonitorOutlined, WalletOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, shopsRes, ordersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/shops/pending'),
        api.get('/admin/orders')
      ]);
      setStats(statsRes.data);
      setPendingShops(shopsRes.data);
      setAllOrders(ordersRes.data);
    } catch (error) {
      message.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleVerify = async (shopId: string, approved: boolean) => {
    try {
      await api.post(`/admin/shops/${shopId}/verify`, { is_approved: approved });
      message.success(approved ? 'Shop approved!' : 'Shop rejected');
      fetchDashboardData();
    } catch (error) {
      message.error('Verification failed');
    }
  };

  const shopColumns = [
    { title: 'Shop Name', dataIndex: 'name', key: 'name' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { 
      title: 'Action', 
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small"
            icon={<CheckCircleOutlined />} 
            onClick={() => handleVerify(record.id, true)}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Approve
          </Button>
          <Button 
            danger 
            size="small"
            icon={<CloseCircleOutlined />} 
            onClick={() => handleVerify(record.id, false)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const orderColumns = [
    { title: 'Date', dataIndex: 'created_at', key: 'date', render: (d: string) => new Date(d).toLocaleDateString() },
    { title: 'Shop', dataIndex: 'shop_name', key: 'shop', render: (s: string) => <Tag icon={<ShopOutlined />}>{s}</Tag> },
    { title: 'Buyer', dataIndex: 'buyer_name', key: 'buyer', render: (b: string) => <Text type="secondary">{b}</Text> },
    { title: 'Amount', dataIndex: 'total_amount', key: 'amount', render: (a: string) => <Text strong>${a}</Text> },
    { title: 'Fee (10%)', dataIndex: 'platform_fee', key: 'fee', render: (f: string) => <Badge status="processing" text={<Text style={{ color: '#ff4d4f' }}>+${f}</Text>} /> },
    { title: 'Payment', dataIndex: 'payment_method', key: 'method', render: (m: string) => <Tag color={m === 'STRIPE' ? 'blue' : 'cyan'}>{m}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'PAID' || s === 'DELIVERED' ? 'green' : 'gold'}>{s}</Tag> },
  ];

  if (loading && !stats) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Platform Administration</Title>
        <Button icon={<MonitorOutlined />} onClick={fetchDashboardData}>Refresh Monitor</Button>
      </div>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Total Volume" value={stats?.total_revenue} precision={2} prefix={<DollarOutlined />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #52c41a' }}>
            <Statistic title="Received Payments" value={stats?.total_received_amount} precision={2} prefix={<WalletOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Platform Earnings" value={stats?.total_platform_fees} precision={2} prefix={<TransactionOutlined />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Total Shops" value={stats?.total_shops} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Total Customers" value={stats?.total_users} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={24}>
          <Card title={<Space><HistoryOutlined /> Platform Order Monitor (All Transactions)</Space>} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Table 
              columns={orderColumns} 
              dataSource={allOrders} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No orders recorded yet' }}
            />
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Pending Verifications" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Table 
              columns={shopColumns} 
              dataSource={pendingShops} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 5 }}
              locale={{ emptyText: 'No pending shop applications' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
