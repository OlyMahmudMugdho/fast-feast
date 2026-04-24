'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Row, Col, Card, Space, Divider, Badge, Spin, Alert, Tag, Avatar } from 'antd';
import { 
  ShoppingOutlined, 
  ShopOutlined, 
  SafetyCertificateOutlined, 
  ThunderboltOutlined,
  GlobalOutlined,
  HeartFilled,
  ArrowRightOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MenuOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';
import { useCart } from '@/lib/CartContext';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function LandingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cart, setIsOpen } = useCart();

  useEffect(() => {
    const fetchLandingData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [itemsRes, catsRes] = await Promise.all([
          api.get('/public/items'),
          api.get('/public/categories')
        ]);
        // Limit to 6 or 9 or 12 to ensure even rows depending on grid config
        // Using 6 items with a 3-column grid (lg={8}) or 4-column (lg={6})
        setItems(itemsRes.data.slice(0, 12));
        setCategories(catsRes.data);
      } catch (err: any) {
        console.error('Landing page data fetch failed:', err);
        setError('Unable to load featured dishes. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Navbar */}
      <Header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 20px',
        height: '70px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Title level={3} style={{ margin: 0, color: '#ff4d4f', fontWeight: 800, fontSize: 'clamp(18px, 5vw, 24px)' }}>
            Fast-Feast
          </Title>
        </div>
        <Space size="middle">
          <Badge count={cart.length} showZero offset={[0, 0]}>
            <Button 
              type="text" 
              icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />} 
              onClick={() => setIsOpen(true)}
            />
          </Badge>
          <Link href="/buyer/dashboard" className="hide-mobile"><Button type="text">Browse</Button></Link>
          <Link href="/login"><Button type="text">Login</Button></Link>
          <Link href="/register/buyer"><Button type="primary" shape="round">Sign Up</Button></Link>
        </Space>
      </Header>

      <Content>
        {/* Hero Section */}
        <div style={{ 
          padding: 'clamp(40px, 10vh, 100px) 20px', 
          background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)',
          textAlign: 'center'
        }}>
          <Row justify="center">
            <Col xs={24} sm={22} md={18} lg={16}>
              <Badge count="Fresh & Fast" style={{ backgroundColor: '#ff4d4f' }} />
              <Title style={{ fontSize: 'clamp(32px, 8vw, 64px)', marginTop: '20px', fontWeight: 800, lineHeight: 1.2 }}>
                Your Favorite Food,<br /> 
                <span style={{ color: '#ff4d4f' }}>Delivered Instantly.</span>
              </Title>
              <Paragraph style={{ fontSize: 'clamp(16px, 3vw, 20px)', color: '#666', marginBottom: '40px', maxWidth: '700px', marginInline: 'auto' }}>
                Discover the best local restaurants and get your meals delivered hot and fresh. Support local businesses while satisfying your cravings.
              </Paragraph>
              <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                <Link href="/buyer/dashboard">
                  <Button type="primary" size="large" icon={<ShoppingOutlined />} style={{ height: '50px', padding: '0 30px', fontSize: '18px' }} shape="round">
                    Start Ordering
                  </Button>
                </Link>
                <Link href="/register/shop">
                  <Button size="large" icon={<ShopOutlined />} style={{ height: '50px', padding: '0 30px', fontSize: '18px' }} shape="round">
                    Open a Shop
                  </Button>
                </Link>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Categories Section */}
        <div style={{ padding: '30px 20px', background: '#fff', textAlign: 'center' }}>
          {categories.length > 0 && (
            <Space size={[12, 12]} wrap style={{ justifyContent: 'center' }}>
              {categories.map((cat) => (
                <Tag key={cat} color="red" style={{ padding: '6px 20px', fontSize: 14, borderRadius: 20, cursor: 'pointer', margin: '4px' }}>
                  {cat}
                </Tag>
              ))}
            </Space>
          )}
        </div>

        {/* Featured Dishes Section */}
        <div style={{ padding: '60px 20px', background: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <Title level={2} style={{ fontWeight: 700, fontSize: 'clamp(24px, 5vw, 36px)' }}>Featured Dishes</Title>
            <Paragraph style={{ fontSize: 16, color: '#666' }}>Taste the best from our verified local vendors</Paragraph>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
          ) : error ? (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <Alert message={error} type="error" showIcon action={<Button size="small" onClick={() => window.location.reload()}>Retry</Button>} />
            </div>
          ) : (
            <Row gutter={[32, 32]} justify="start" align="stretch">
              {items.map((item) => (
                <Col xs={24} sm={12} lg={8} key={item.id}>
                  <Card 
                    hoverable 
                    cover={
                      <div style={{ 
                        height: 220, 
                        backgroundImage: item.image_url ? `url(${item.image_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#fafafa'
                      }} />
                    }
                    style={{ borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
                    bodyStyle={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <Title level={4} style={{ margin: 0, fontSize: 18 }} ellipsis={{ rows: 1 }}>{item.name}</Title>
                      <Text strong style={{ fontSize: 18, color: '#ff4d4f', whiteSpace: 'nowrap', marginLeft: 8 }}>${item.price}</Text>
                    </div>
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: 14, marginBottom: 20, flex: 1 }}>
                      {item.description}
                    </Paragraph>
                    <div style={{ marginTop: 'auto' }}>
                      <Link href={`/buyer/item?id=${item.id}`}>
                        <Button type="primary" block shape="round" icon={<ArrowRightOutlined />}>View Details</Button>
                      </Link>
                    </div>
                  </Card>
                </Col>
              ))}
              {items.length === 0 && (
                <Col span={24} style={{ textAlign: 'center' }}>
                  <Text type="secondary">No dishes available at the moment.</Text>
                </Col>
              )}
            </Row>
          )}
          
          <div style={{ textAlign: 'center', marginTop: 64 }}>
            <Link href="/buyer/dashboard">
              <Button size="large" shape="round" style={{ padding: '0 60px', height: 50, fontSize: 16 }}>Browse All Marketplace</Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ padding: '80px 20px', background: '#fafafa' }}>
          <Row gutter={[32, 48]} justify="center" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Col xs={24} sm={12} md={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: 'transparent' }}>
                <ThunderboltOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '24px' }} />
                <Title level={4}>Lightning Fast</Title>
                <Paragraph>Food arrives while it's still steaming hot and fresh.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: 'transparent' }}>
                <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '24px' }} />
                <Title level={4}>Verified Shops</Title>
                <Paragraph>Every partner is verified for quality and hygiene standards.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: 'transparent' }}>
                <GlobalOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '24px' }} />
                <Title level={4}>Local Support</Title>
                <Paragraph>Supporting local vendors with advanced business tools.</Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer style={{ background: '#141414', padding: '60px 20px 30px', color: 'rgba(255,255,255,0.65)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Title level={3} style={{ color: '#ff4d4f', marginBottom: 24 }}>Fast-Feast</Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 300 }}>
                The premium multi-vendor food selling platform connecting the best local chefs with hungry customers.
              </Paragraph>
              <Space size="large" style={{ fontSize: 24, marginTop: 16 }}>
                <FacebookOutlined style={{ cursor: 'pointer' }} />
                <TwitterOutlined style={{ cursor: 'pointer' }} />
                <InstagramOutlined style={{ cursor: 'pointer' }} />
                <YoutubeOutlined style={{ cursor: 'pointer' }} />
              </Space>
            </Col>
            
            <Col xs={12} sm={8} md={4}>
              <Title level={5} style={{ color: '#fff', marginBottom: 24 }}>About</Title>
              <Space direction="vertical">
                <Link href="#"><Text style={{ color: 'inherit' }}>Our Story</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Team</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Careers</Text></Link>
              </Space>
            </Col>

            <Col xs={12} sm={8} md={4}>
              <Title level={5} style={{ color: '#fff', marginBottom: 24 }}>Partners</Title>
              <Space direction="vertical">
                <Link href="/register/shop"><Text style={{ color: 'inherit' }}>Open a Shop</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Guidelines</Text></Link>
              </Space>
            </Col>

            <Col xs={12} sm={8} md={4}>
              <Title level={5} style={{ color: '#fff', marginBottom: 24 }}>Legal</Title>
              <Space direction="vertical">
                <Link href="#"><Text style={{ color: 'inherit' }}>Privacy</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Terms</Text></Link>
              </Space>
            </Col>

            <Col xs={12} sm={24} md={4}>
              <Title level={5} style={{ color: '#fff', marginBottom: 24 }}>Mobile</Title>
              <Space direction="vertical">
                 <Badge status="processing" text={<span style={{ color: 'rgba(255,255,255,0.45)' }}>iOS App</span>} />
                 <Badge status="processing" text={<span style={{ color: 'rgba(255,255,255,0.45)' }}>Android App</span>} />
              </Space>
            </Col>
          </Row>
          
          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '40px 0' }} />
          
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.3)' }}>
              ©2026 Fast-Feast Inc. Made with <HeartFilled style={{ color: '#ff4d4f' }} />
            </Text>
          </div>
        </div>
      </Footer>
      
      <style jsx global>{`
        @media (max-width: 576px) {
          .hide-mobile {
            display: none !important;
          }
          .ant-layout-header {
            padding: 0 12px !important;
          }
        }
      `}</style>
    </Layout>
  );
}
