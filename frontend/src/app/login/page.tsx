'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Layout, Row, Col, Divider, Checkbox, Space } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      const { access_token, role } = response.data;
      
      // Fetch user profile to get ID
      const profileRes = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${access_token}` }
      });
      const userId = profileRes.data.id;

      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      
      message.success('Welcome back!');
      
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
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Row style={{ minHeight: '100vh' }}>
        {/* Left Side: Illustration/Image */}
        <Col xs={0} md={12} lg={14} style={{ 
          background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px'
        }}>
          <Title style={{ color: '#fff', fontSize: '48px', fontWeight: 800, marginBottom: '24px' }}>
            Delicious food is<br /> just a click away.
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', maxWidth: '500px' }}>
            Join our community of food lovers and local vendors. Experience the fastest delivery and the best flavors in town.
          </Paragraph>
          
          <div style={{ marginTop: 'auto' }}>
            <Text style={{ color: '#fff', opacity: 0.7 }}>© 2026 Fast-Feast Platform</Text>
          </div>
        </Col>

        {/* Right Side: Form */}
        <Col xs={24} md={12} lg={10} style={{ display: 'flex', flexDirection: 'column', padding: '40px' }}>
          <div style={{ marginBottom: 'auto' }}>
             <Link href="/">
              <Button icon={<ArrowLeftOutlined />} type="text">Home</Button>
            </Link>
          </div>

          <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', paddingBottom: '100px' }}>
            <div style={{ marginBottom: '40px' }}>
              <Title level={2} style={{ color: '#ff4d4f', marginBottom: '8px', fontWeight: 800 }}>Sign In</Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>Enter your credentials to access your account</Text>
            </div>

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              initialValues={{ remember: true }}
            >
              <Form.Item
                name="email"
                rules={[{ required: true, message: 'Email is required!', type: 'email' }]}
              >
                <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="Email Address" style={{ borderRadius: '8px' }} />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Password is required!' }]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="Password" style={{ borderRadius: '8px' }} />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Link href="#" style={{ color: '#ff4d4f' }}>Forgot password?</Link>
              </div>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block style={{ height: '50px', borderRadius: '8px', fontWeight: 600, fontSize: '16px' }}>
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider plain><Text type="secondary">or continue with</Text></Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Button block icon={<GoogleOutlined />} style={{ borderRadius: '8px' }}>Google</Button>
              </Col>
              <Col span={12}>
                <Button block icon={<GithubOutlined />} style={{ borderRadius: '8px' }}>GitHub</Button>
              </Col>
            </Row>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Text type="secondary">New to Fast-Feast? </Text>
              <Link href="/register/buyer" style={{ fontWeight: 600, color: '#ff4d4f' }}>Create an account</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Layout>
  );
}
