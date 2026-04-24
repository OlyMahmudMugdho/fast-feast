'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Layout, Divider, Space, Card, Steps, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ShopOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ShopRegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/auth/register/shop', values);
      message.success('Application submitted! We will review and approve your shop soon.');
      router.push('/login');
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9fa', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href="/">
            <Button icon={<ArrowLeftOutlined />} type="text">Back to Home</Button>
          </Link>
        </div>

        <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <Row gutter={48}>
            <Col xs={24} md={10} style={{ borderRight: '1px solid #f0f0f0', paddingRight: '40px' }} className="hide-mobile-col">
              <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
                 <ShopOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '20px' }} />
                 <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Partner with Us</Title>
                 <Paragraph type="secondary" style={{ marginTop: '16px' }}>
                   Join Fast-Feast and reach thousands of new customers in your area.
                 </Paragraph>
              </div>
              
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                   <div style={{ background: '#fff1f0', padding: '10px', borderRadius: '8px', height: 'fit-content' }}>
                      <Text strong style={{ color: '#ff4d4f' }}>01</Text>
                   </div>
                   <div>
                      <Text strong>Register</Text><br />
                      <Text type="secondary" style={{ fontSize: '13px' }}>Create your owner account and shop profile</Text>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                   <div style={{ background: '#fff1f0', padding: '10px', borderRadius: '8px', height: 'fit-content' }}>
                      <Text strong style={{ color: '#ff4d4f' }}>02</Text>
                   </div>
                   <div>
                      <Text strong>Approval</Text><br />
                      <Text type="secondary" style={{ fontSize: '13px' }}>Admin verifies your business details</Text>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                   <div style={{ background: '#fff1f0', padding: '10px', borderRadius: '8px', height: 'fit-content' }}>
                      <Text strong style={{ color: '#ff4d4f' }}>03</Text>
                   </div>
                   <div>
                      <Text strong>Sell</Text><br />
                      <Text type="secondary" style={{ fontSize: '13px' }}>List your menu and start receiving orders</Text>
                   </div>
                </div>
              </Space>
            </Col>

            <Col xs={24} md={14} style={{ paddingLeft: '40px' }}>
               <div style={{ marginBottom: '32px' }}>
                  <Title level={3} style={{ fontWeight: 700 }}>Shop Application</Title>
                  <Text type="secondary">Provide your business details to get started</Text>
               </div>

               <Form
                name="register_shop"
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="full_name"
                  label="Owner Full Name"
                  rules={[{ required: true, message: 'Owner name is required!' }]}
                >
                  <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="Full Name" style={{ borderRadius: '8px' }} />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Business Email"
                  rules={[{ required: true, type: 'email', message: 'Valid email is required!' }]}
                >
                  <Input prefix={<MailOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="Email Address" style={{ borderRadius: '8px' }} />
                </Form.Item>

                <Form.Item
                  name="shop_name"
                  label="Restaurant/Shop Name"
                  rules={[{ required: true, message: 'Shop name is required!' }]}
                >
                  <Input prefix={<ShopOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="Shop Name" style={{ borderRadius: '8px' }} />
                </Form.Item>

                <Form.Item
                  name="shop_address"
                  label="Business Address"
                  rules={[{ required: true, message: 'Address is required!' }]}
                >
                  <TextArea rows={3} placeholder="Full physical address" style={{ borderRadius: '8px' }} />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Account Password"
                  rules={[{ required: true, min: 8, message: 'Min 8 characters!' }]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="Create Password" style={{ borderRadius: '8px' }} />
                </Form.Item>

                <Form.Item style={{ marginTop: '32px' }}>
                  <Button type="primary" htmlType="submit" loading={loading} block style={{ height: '50px', borderRadius: '8px', fontWeight: 600, fontSize: '16px' }}>
                    Submit Application
                  </Button>
                </Form.Item>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <Text type="secondary">Already have a partner account? </Text>
                  <Link href="/login" style={{ fontWeight: 600, color: '#ff4d4f' }}>Sign In</Link>
                </div>
              </Form>
            </Col>
          </Row>
        </Card>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .hide-mobile-col {
            display: none !important;
          }
          .ant-col-xs-24 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        }
      `}</style>
    </Layout>
  );
}
