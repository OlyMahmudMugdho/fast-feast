'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Layout } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      const { access_token, role } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      
      message.success('Login successful!');
      
      // Redirect based on role
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (role === 'SHOP_OWNER' || role === 'SHOP_EMPLOYEE') {
        router.push('/shop/dashboard');
      } else {
        router.push('/buyer/dashboard');
      }
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
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
      
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#ff4d4f', margin: 0 }}>Fast-Feast</Title>
          <Text type="secondary">Login to your account</Text>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your Email!', type: 'email' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 45 }}>
              Log in
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Don't have an account? </Text>
            <Link href="/register/buyer">Register as Buyer</Link>
            <div style={{ marginTop: 8 }}>
               <Link href="/register/shop" style={{ color: '#666' }}>Interested in selling? Join as Shop</Link>
            </div>
          </div>
        </Form>
      </Card>
    </Layout>
  );
}
