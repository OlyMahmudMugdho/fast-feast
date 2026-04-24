'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Layout, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function BuyerRegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/auth/register/buyer', values);
      message.success('Registration successful! Please login.');
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

      <Card style={{ width: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 12, margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#ff4d4f', margin: 0 }}>Join Fast-Feast</Title>
          <Text type="secondary">Create your buyer account</Text>
        </div>

        <Form
          name="register_buyer"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input your Full Name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="e.g. John Doe" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please input your Email!', type: 'email' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="e.g. john@example.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please input your Phone Number!' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="e.g. 1234567890" />
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 45 }}>
              Create Account
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Already have an account? </Text>
            <Link href="/login">Login here</Link>
          </div>
        </Form>
      </Card>
    </Layout>
  );
}
