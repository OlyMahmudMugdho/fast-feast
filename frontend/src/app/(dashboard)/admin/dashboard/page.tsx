'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Button, message, Space } from 'antd';
import { ShopOutlined, UserOutlined, ShoppingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title } = Typography;

export default function AdminDashboard() {
  const [stats, setStats] = useState({ shops: 0, users: 0, orders: 0 });
  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // In a real app, we'd have a specific admin stats endpoint
      // For now, we'll just fetch pending shops
      const shopsRes = await api.get('/admin/shops/pending');
      setPendingShops(shopsRes.data);
      
      // Mock stats for UI
      setStats({ shops: shopsRes.data.length + 5, users: 120, orders: 45 });
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

  const columns = [
    { title: 'Shop Name', dataRef: 'name', key: 'name', dataIndex: 'name' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { 
      title: 'Action', 
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />} 
            onClick={() => handleVerify(record.id, true)}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Approve
          </Button>
          <Button 
            danger 
            icon={<CloseCircleOutlined />} 
            onClick={() => handleVerify(record.id, false)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Admin Overview</Title>
      
      <Row gutter={16} style={{ marginBottom: 32 }}>
        <Col span={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Total Shops" value={stats.shops} prefix={<ShopOutlined />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Total Users" value={stats.users} prefix={<UserOutlined />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Total Orders" value={stats.orders} prefix={<ShoppingOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Card title="Pending Shop Approvals" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table 
          columns={columns} 
          dataSource={pendingShops} 
          rowKey="id" 
          loading={loading}
          locale={{ emptyText: 'No pending shops' }}
        />
      </Card>
    </div>
  );
}
