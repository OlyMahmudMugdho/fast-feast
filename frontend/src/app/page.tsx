'use client';

import React from 'react';
import { Layout, Button, Typography, Row, Col, Card, Space, Divider, Badge } from 'antd';
import { 
  ShoppingOutlined, 
  ShopOutlined, 
  SafetyCertificateOutlined, 
  ThunderboltOutlined,
  GlobalOutlined,
  HeartFilled
} from '@ant-design/icons';
import Link from 'next/link';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function LandingPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Navbar */}
      <Header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 50px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Title level={3} style={{ margin: 0, color: '#ff4d4f', fontWeight: 800 }}>
            Fast-Feast
          </Title>
        </div>
        <Space size="large">
          <Link href="/login"><Button type="text">Login</Button></Link>
          <Link href="/register/buyer"><Button type="primary" shape="round">Join as Buyer</Button></Link>
          <Link href="/register/shop"><Button shape="round">Open a Shop</Button></Link>
        </Space>
      </Header>

      <Content>
        {/* Hero Section */}
        <div style={{ 
          padding: '100px 50px', 
          background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)',
          textAlign: 'center'
        }}>
          <Row justify="center" align="middle">
            <Col xs={24} md={16}>
              <Badge count="Fresh & Fast" style={{ backgroundColor: '#ff4d4f' }} />
              <Title style={{ fontSize: '64px', marginTop: '20px', fontWeight: 800 }}>
                Your Favorite Food,<br /> 
                <span style={{ color: '#ff4d4f' }}>Delivered Instantly.</span>
              </Title>
              <Paragraph style={{ fontSize: '20px', color: '#666', marginBottom: '40px' }}>
                Discover the best local restaurants and get your meals delivered hot and fresh. 
                Support local businesses while satisfying your cravings.
              </Paragraph>
              <Space size="middle">
                <Button type="primary" size="large" icon={<ShoppingOutlined />} style={{ height: '50px', padding: '0 40px', fontSize: '18px' }} shape="round">
                  Start Ordering
                </Button>
                <Button size="large" icon={<ShopOutlined />} style={{ height: '50px', padding: '0 40px', fontSize: '18px' }} shape="round">
                  Partner with Us
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Features Section */}
        <div style={{ padding: '80px 50px', background: '#fff' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '60px', fontWeight: 700 }}>
            Why Choose Fast-Feast?
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: '#fafafa' }}>
                <ThunderboltOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '24px' }} />
                <Title level={4}>Lightning Fast</Title>
                <Paragraph>Our optimized delivery network ensures your food arrives while it's still steaming hot.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: '#fafafa' }}>
                <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '24px' }} />
                <Title level={4}>Verified Shops</Title>
                <Paragraph>Every restaurant on our platform is hand-picked and verified for quality and hygiene.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: '#fafafa' }}>
                <GlobalOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '24px' }} />
                <Title level={4}>Local Support</Title>
                <Paragraph>We empower local vendors by giving them the tools to reach thousands of new customers.</Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Call to Action Section */}
        <div style={{ 
          padding: '80px 50px', 
          background: '#141414', 
          color: '#fff',
          textAlign: 'center'
        }}>
          <Title level={2} style={{ color: '#fff', marginBottom: '24px' }}>Ready to satisfy your hunger?</Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.65)', fontSize: '18px', marginBottom: '40px' }}>
            Join thousands of happy foodies today.
          </Paragraph>
          <Button type="primary" size="large" shape="round" style={{ height: '50px', padding: '0 60px' }}>
            Get Started Now
          </Button>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', padding: '40px 50px', background: '#fff' }}>
        <Divider />
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>Fast-Feast</Title>
          </Col>
          <Col>
            <Text type="secondary">Made with <HeartFilled style={{ color: '#ff4d4f' }} /> for Food Lovers</Text>
          </Col>
          <Col>
            <Space size="large">
              <Link href="#"><Text type="secondary">Privacy Policy</Text></Link>
              <Link href="#"><Text type="secondary">Terms of Service</Text></Link>
              <Link href="#"><Text type="secondary">Contact</Text></Link>
            </Space>
          </Col>
        </Row>
        <div style={{ marginTop: '24px' }}>
          <Text type="secondary">©2026 Fast-Feast Inc. All rights reserved.</Text>
        </div>
      </Footer>
    </Layout>
  );
}
