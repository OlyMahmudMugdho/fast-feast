'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Layout, Row, Col, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined, GoogleOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function BuyerRegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/auth/register/buyer', values);
      message.success('Account created successfully! Please sign in.');
      router.push('/login');
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Row style={{ minHeight: '100vh' }}>
        {/* Left Side: Form */}
        <Col xs={24} md={12} lg={10} style={{ display: 'flex', flexDirection: 'column', padding: '40px' }}>
          <div style={{ marginBottom: 'auto' }}>
             <Link href="/">
              <Button icon={<ArrowLeftOutlined />} type="text">Home</Button>
            </Link>
          </div>

          <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
              <Title level={2} style={{ color: '#ff4d4f', marginBottom: '8px', fontWeight: 800 }}>Create Account</Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>Join the community of food lovers today</Text>
            </div>

            <Form
              name="register"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="full_name"
                rules={[{ required: true, message: 'Please enter your full name!' }]}
              >
                <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="Full Name" style={{ borderRadius: '8px' }} />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Email is required!' },
                  { type: 'email', message: 'Enter a valid email!' }
                ]}
              >
                <Input prefix={<MailOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="Email Address" style={{ borderRadius: '8px' }} />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[{ required: true, message: 'Phone number is required!' }]}
              >
                <Input prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="Phone Number" style={{ borderRadius: '8px' }} />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Password is required!' },
                  { min: 8, message: 'Min 8 characters!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="Create Password" style={{ borderRadius: '8px' }} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block style={{ height: '50px', borderRadius: '8px', fontWeight: 600, fontSize: '16px', marginTop: '16px' }}>
                  Create Account
                </Button>
              </Form.Item>
            </Form>

            <Divider plain><Text type="secondary">or sign up with</Text></Divider>

            <Button block icon={<GoogleOutlined />} style={{ borderRadius: '8px', height: '40px' }}>Sign up with Google</Button>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '40px' }}>
              <Text type="secondary">Already have an account? </Text>
              <Link href="/login" style={{ fontWeight: 600, color: '#ff4d4f' }}>Sign In</Link>
            </div>
          </div>
        </Col>

        {/* Right Side: Image */}
        <Col xs={0} md={12} lg={14} style={{ 
          background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          textAlign: 'right'
        }}>
          <Title style={{ color: '#fff', fontSize: '48px', fontWeight: 800, marginBottom: '24px' }}>
            Freshness in<br />every bite.
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', maxWidth: '500px', marginLeft: 'auto' }}>
            Browse through hundreds of local restaurants and discover your next favorite meal. Fast, reliable, and always delicious.
          </Paragraph>
        </Col>
      </Row>
    </Layout>
  );
}
