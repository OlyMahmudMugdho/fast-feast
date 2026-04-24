'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Layout, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ShopOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ShopRegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/auth/register/shop', values);
      message.success('Shop application submitted! Please wait for admin approval before logging in.');
      router.push('/login');
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <Link href="/">
          <Button icon={<ArrowLeftOutlined />} type="text">Back to Home</Button>
        </Link>
      </div>

      <Card style={{ width: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 12, margin: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#ff4d4f', margin: 0 }}>Partner with Fast-Feast</Title>
          <Text type="secondary">Reach more customers and grow your business</Text>
        </div>

        <Form
          name="register_shop"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Divider>Owner Information</Divider>
          
          <Form.Item
            name="full_name"
            label="Owner Full Name"
            rules={[{ required: true, message: 'Please input your Name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="e.g. Jane Smith" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[{ required: true, message: 'Please input your Email!', type: 'email' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="e.g. shop@example.com" />
          </Form.Item>

          <Divider>Shop Information</Divider>

          <Form.Item
            name="shop_name"
            label="Shop Name"
            rules={[{ required: true, message: 'Please input your Shop Name!' }]}
          >
            <Input prefix={<ShopOutlined />} placeholder="e.g. The Gourmet Kitchen" />
          </Form.Item>

          <Form.Item
            name="shop_address"
            label="Physical Address"
            rules={[{ required: true, message: 'Please input your Shop Address!' }]}
          >
            <TextArea rows={3} placeholder="Full business address" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your Password!' },
              { min: 8, message: 'Password must be at least 8 characters!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Min 8 characters" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 45 }}>
              Register Shop
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Already have a shop account? </Text>
            <Link href="/login">Login here</Link>
          </div>
        </Form>
      </Card>
    </Layout>
  );
}
