'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Avatar, Button, Tag, Space, Divider, message, Spin, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, EditOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (error) {
        message.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Account Profile</Title>
      
      <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}>
        <Row align="middle" gutter={32}>
          <Col>
            <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#ff4d4f' }} />
          </Col>
          <Col>
            <Title level={3} style={{ margin: 0 }}>{user.full_name}</Title>
            <Tag color="blue">{user.role}</Tag>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary"><CalendarOutlined /> Joined {new Date(user.created_at).toLocaleDateString()}</Text>
            </div>
          </Col>
        </Row>
        
        <Divider />
        
        <Descriptions title="User Information" column={1} bordered size="small">
          <Descriptions.Item label={<span><MailOutlined /> Email</span>}>{user.email}</Descriptions.Item>
          <Descriptions.Item label={<span><PhoneOutlined /> Phone</span>}>{user.phone || 'Not provided'}</Descriptions.Item>
          <Descriptions.Item label="Account Status">
            <Tag color={user.is_active ? 'green' : 'red'}>{user.is_active ? 'Active' : 'Inactive'}</Tag>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 32 }}>
          <Button type="primary" icon={<EditOutlined />}>Edit Profile</Button>
          <Button type="link" style={{ marginLeft: 16 }}>Change Password</Button>
        </div>
      </Card>
    </div>
  );
}
