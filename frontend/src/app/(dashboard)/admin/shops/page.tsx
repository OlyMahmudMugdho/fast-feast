'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, message, Card, Button, Space, Input } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title } = Typography;

export default function AdminShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/shops');
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

  const handleVerify = async (shopId: string, approved: boolean) => {
    try {
      await api.post(`/admin/shops/${shopId}/verify`, { is_approved: approved });
      message.success(approved ? 'Shop approved' : 'Shop rejected');
      fetchShops();
    } catch (error) {
      message.error('Action failed');
    }
  };

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'Shop Name', dataIndex: 'name', key: 'name', fontWeight: 600 },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        if (status === 'APPROVED') color = 'green';
        if (status === 'REJECTED') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.status === 'PENDING' && (
            <>
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleVerify(record.id, true)}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Approve
              </Button>
              <Button 
                danger 
                size="small"
                onClick={() => handleVerify(record.id, false)}
              >
                Reject
              </Button>
            </>
          )}
          {record.status !== 'PENDING' && <Text type="secondary">No actions</Text>}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Manage Vendors</Title>
        <Input 
          placeholder="Search shops..." 
          prefix={<SearchOutlined />} 
          style={{ width: 300 }}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table 
          dataSource={filteredShops} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
        />
      </Card>
    </div>
  );
}

import { Typography as AntTypography } from 'antd';
const { Text } = AntTypography;
