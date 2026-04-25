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
  ShoppingCartOutlined,
  StarFilled,
  PlusOutlined
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
  const { cart: cartItems, addToCart, setIsOpen } = useCart();

  useEffect(() => {
    const fetchLandingData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [itemsRes, catsRes] = await Promise.all([
          api.get('/public/items'),
          api.get('/public/categories')
        ]);
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
          <Badge count={cartItems.length} showZero offset={[0, 0]}>
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
        {/* Professional Hero Section */}
        <div style={{ 
          position: 'relative',
          padding: 'clamp(40px, 8vh, 80px) 20px',
          background: '#fff',
          overflow: 'hidden'
        }}>
          {/* Decorative background element */}
          <div style={{
            position: 'absolute',
            top: '-5%',
            right: '-5%',
            width: '45%',
            height: '110%',
            background: '#fff5f5',
            borderRadius: '100% 0 0 100%',
            zIndex: 0
          }} className="hide-mobile" />

          <Row gutter={[48, 48]} align="middle" style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto' }}>
            <Col xs={24} lg={12}>
              <Space direction="vertical" size="middle">
                <Badge 
                  status="processing" 
                  color="#ff4d4f" 
                  text={<Text strong style={{ color: '#ff4d4f', letterSpacing: 0.5, fontSize: 12 }}>NEW FLAVORS ADDED WEEKLY</Text>} 
                  style={{ background: '#fff1f0', padding: '4px 12px', borderRadius: '20px' }}
                />
                
                <Title style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.1, margin: 0 }}>
                  Premium Food<br />
                  <span style={{ color: '#ff4d4f' }}>At Your Door.</span>
                </Title>
                
                <Paragraph style={{ fontSize: 'clamp(16px, 1.5vw, 18px)', color: '#434343', maxWidth: '550px', lineHeight: 1.6, margin: 0 }}>
                  Experience culinary excellence from top-rated local restaurants. Fresh, hot, and exactly how you like it.
                </Paragraph>
                
                <Space size="large" wrap style={{ marginTop: 16 }}>
                  <Link href="/buyer/dashboard">
                    <Button type="primary" size="large" icon={<ShoppingOutlined />} style={{ height: 60, padding: '0 40px', fontSize: 18, borderRadius: 12, boxShadow: '0 8px 15px rgba(255, 77, 79, 0.2)' }}>
                      Order Now
                    </Button>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex' }}>
                       {[1,2,3,4,5].map(i => <StarFilled key={i} style={{ color: '#fadb14', fontSize: 20 }} />)}
                    </div>
                    <Text strong style={{ fontSize: 16 }}>4.9/5 (10k+ Reviews)</Text>
                  </div>
                </Space>

                <div style={{ marginTop: 40, display: 'flex', gap: 40 }} className="hide-mobile">
                  <div>
                    <Title level={3} style={{ margin: 0 }}>500+</Title>
                    <Text type="secondary">Partner Restaurants</Text>
                  </div>
                  <div>
                    <Title level={3} style={{ margin: 0 }}>20k+</Title>
                    <Text type="secondary">Daily Deliveries</Text>
                  </div>
                </div>
              </Space>
            </Col>
            
            <Col xs={24} lg={12}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '10%',
                  left: '-5%',
                  width: '100%',
                  height: '100%',
                  background: 'rgba(255, 77, 79, 0.05)',
                  borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                  zIndex: -1
                }} />
                <img 
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" 
                  alt="Delicious Healthy Food" 
                  style={{ 
                    width: '100%', 
                    borderRadius: '24px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    transform: 'rotate(-2deg)'
                  }}
                />
                {/* Floating Card UI */}
                <Card style={{ 
                  position: 'absolute', 
                  bottom: '10%', 
                  left: '-10%', 
                  borderRadius: 16, 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  width: 220
                }} className="hide-mobile">
                  <Space align="start">
                    <Avatar src="https://images.unsplash.com/photo-1550547660-d9450f859349" size="large" />
                    <div>
                      <Text strong>Double Cheese Burger</Text><br />
                      <Text type="secondary" style={{ fontSize: 12 }}>Delivered in 20 mins</Text>
                    </div>
                  </Space>
                </Card>
              </div>
            </Col>
          </Row>
        </div>

        {/* Categories Section */}
        <div style={{ padding: '40px 50px', background: '#fff', textAlign: 'center', borderTop: '1px solid #f5f5f5' }}>
          <Space size={[16, 16]} wrap style={{ justifyContent: 'center' }}>
            {categories.map((cat) => (
              <Tag key={cat} color="red" style={{ padding: '8px 24px', fontSize: 16, borderRadius: 20, cursor: 'pointer' }}>
                {cat}
              </Tag>
            ))}
          </Space>
        </div>

        {/* Featured Dishes Section */}
        <div style={{ padding: '80px 50px', background: '#fff', maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2} style={{ fontWeight: 800, fontSize: 36 }}>Our Popular Dishes</Title>
            <Paragraph style={{ fontSize: 18, color: '#666' }}>The most loved flavors from our top local kitchens</Paragraph>
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
                        height: 240, 
                        backgroundImage: item.image_url ? `url(${item.image_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#fafafa'
                      }} />
                    }
                    style={{ borderRadius: 20, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0' }}
                    bodyStyle={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <Title level={4} style={{ margin: 0, fontSize: 19 }} ellipsis={{ rows: 1 }}>{item.name}</Title>
                      <Text strong style={{ fontSize: 19, color: '#ff4d4f' }}>${item.price}</Text>
                    </div>
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: 15, marginBottom: 24, flex: 1 }}>
                      {item.description}
                    </Paragraph>
                    <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => addToCart(item)}
                        shape="round"
                        style={{ flex: 1 }}
                      >
                        Add
                      </Button>
                      <Link href={`/buyer/item?id=${item.id}`} style={{ flex: 1 }}>
                        <Button block shape="round">Details</Button>
                      </Link>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          
          <div style={{ textAlign: 'center', marginTop: 64 }}>
            <Link href="/buyer/dashboard">
              <Button size="large" shape="round" style={{ padding: '0 60px', height: 55, fontSize: 18, fontWeight: 600 }}>Explore More</Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ padding: '100px 50px', background: '#fafafa' }}>
          <Row gutter={[48, 48]} justify="center" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: 'transparent' }}>
                <div style={{ background: '#fff', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                  <ThunderboltOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                </div>
                <Title level={4}>Fastest Delivery</Title>
                <Paragraph style={{ color: '#666' }}>Optimized routes and dedicated riders ensure your food arrives in record time.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: 'transparent' }}>
                <div style={{ background: '#fff', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                  <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                </div>
                <Title level={4}>Quality Guaranteed</Title>
                <Paragraph style={{ color: '#666' }}>We hand-pick and rigorously verify every single partner on our platform.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: 'transparent' }}>
                <div style={{ background: '#fff', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                  <GlobalOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                </div>
                <Title level={4}>Support Local</Title>
                <Paragraph style={{ color: '#666' }}>Empowering local small businesses with high-end tech and logistical support.</Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer style={{ background: '#141414', padding: '80px 50px 40px', color: 'rgba(255,255,255,0.65)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} md={8}>
              <Title level={3} style={{ color: '#ff4d4f', marginBottom: 24, fontWeight: 800 }}>Fast-Feast</Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 350, fontSize: 16 }}>
                The premium multi-vendor food marketplace. We bring the best local culinary talent directly to your doorstep.
              </Paragraph>
              <Space size="large" style={{ fontSize: 24, marginTop: 24 }}>
                <FacebookOutlined className="footer-icon" style={{ cursor: 'pointer' }} />
                <TwitterOutlined className="footer-icon" style={{ cursor: 'pointer' }} />
                <InstagramOutlined className="footer-icon" style={{ cursor: 'pointer' }} />
                <YoutubeOutlined className="footer-icon" style={{ cursor: 'pointer' }} />
              </Space>
            </Col>
            
            <Col xs={12} sm={8} md={4}>
              <Title level={5} style={{ color: '#fff', marginBottom: 24 }}>Company</Title>
              <Space direction="vertical" size="middle">
                <Link href="#"><Text style={{ color: 'inherit' }}>Our Story</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Meet the Team</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Careers</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Contact Us</Text></Link>
              </Space>
            </Col>

            <Col xs={12} sm={8} md={4}>
              <Title level={5} style={{ color: '#fff', marginBottom: 24 }}>For Partners</Title>
              <Space direction="vertical" size="middle">
                <Link href="/register/shop"><Text style={{ color: 'inherit' }}>Become a Partner</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Vendor Portal</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Guidelines</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Resources</Text></Link>
              </Space>
            </Col>

            <Col xs={12} sm={8} md={4}>
              <Title level={5} style={{ color: '#fff', marginBottom: 24 }}>Support</Title>
              <Space direction="vertical" size="middle">
                <Link href="#"><Text style={{ color: 'inherit' }}>Help Center</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Privacy Policy</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>Terms of Service</Text></Link>
                <Link href="#"><Text style={{ color: 'inherit' }}>FAQs</Text></Link>
              </Space>
            </Col>

            <Col xs={12} sm={24} md={4}>
              <Title level={5} style={{ color: '#fff', marginBottom: 24 }}>Download App</Title>
              <div style={{ marginBottom: 16 }}>
                 <Badge status="processing" text={<span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>iOS App - Coming Soon</span>} />
              </div>
              <div>
                 <Badge status="processing" text={<span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Android - Coming Soon</span>} />
              </div>
            </Col>
          </Row>
          
          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '60px 0 40px' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <Text style={{ color: 'rgba(255,255,255,0.3)' }}>
              © 2026 Fast-Feast Inc. All rights reserved.
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.3)' }}>
              Designed with <HeartFilled style={{ color: '#ff4d4f' }} /> for Food Lovers.
            </Text>
          </div>
        </div>
      </Footer>
      
      <style jsx global>{`
        @media (max-width: 991px) {
          .hide-mobile {
            display: none !important;
          }
        }
        .footer-icon:hover {
          color: #ff4d4f !important;
          transition: color 0.3s;
        }
      `}</style>
    </Layout>
  );
}
