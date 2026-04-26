'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Row, Col, Typography, Card, Space, Input, Badge, Tag, Avatar, message } from 'antd';
import { 
  ShoppingOutlined, 
  ThunderboltOutlined, 
  SafetyCertificateOutlined, 
  EnvironmentOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  StarFilled,
  LoginOutlined,
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/lib/CartContext';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const { cart, setIsOpen, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);

    const fetchData = async () => {
      try {
        const itemsRes = await api.get('/public/items');
        setItems(itemsRes.data.slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch landing data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    clearCart();
    setRole(null);
    message.success('Logged out successfully');
  };

  const getDashboardLink = () => {
    if (!role) return '/login';
    if (role.includes('ADMIN')) return '/admin/dashboard';
    if (role.includes('SHOP')) return '/shop/dashboard';
    return '/buyer/dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Navigation */}
      <Header style={{ 
        position: 'fixed', 
        zIndex: 1000, 
        width: '100%', 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '0 clamp(16px, 5vw, 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#ff4d4f', fontWeight: 800, cursor: 'pointer' }} onClick={() => router.push('/')}>
            Fast-Feast
          </Title>
        </div>

        <Space size="large">
          <Badge count={cart.length} showZero offset={[0, 0]}>
             <Button type="text" icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />} onClick={() => setIsOpen(true)} />
          </Badge>
          
          {role ? (
            <Space size="middle">
              <Link href={getDashboardLink()}>
                <Button type="primary" shape="round" icon={<DashboardOutlined />}>Dashboard</Button>
              </Link>
              <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>Logout</Button>
            </Space>
          ) : (
            <Space>
              <Link href="/login">
                <Button type="text" style={{ fontWeight: 600 }}>Login</Button>
              </Link>
              <Link href="/register/buyer">
                <Button type="primary" shape="round" style={{ fontWeight: 600, background: '#ff4d4f' }}>
                  Sign up
                </Button>
              </Link>
            </Space>
          )}
        </Space>
      </Header>

      <Content style={{ marginTop: 72 }}>
        {/* Hero Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fffcfc 0%, #fff0f0 100%)',
          padding: 'clamp(40px, 10vw, 80px) clamp(16px, 5vw, 120px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Row align="middle" gutter={[40, 40]}>
            <Col xs={24} lg={12}>
              <Tag color="error" style={{ marginBottom: 16, borderRadius: 20, padding: '4px 12px' }}>
                <ThunderboltOutlined /> Fastest Delivery in Town
              </Tag>
              <Title style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 850, lineHeight: 1.1, marginBottom: 24 }}>
                Savor the <span style={{ color: '#ff4d4f' }}>Flavors</span> <br /> Delivered to Your Door
              </Title>
              <Paragraph style={{ fontSize: 18, color: '#666', marginBottom: 40, maxWidth: 500 }}>
                Order from your favorite local restaurants and get fresh, hot meals delivered with lightning speed.
              </Paragraph>
              
              <div style={{ 
                background: '#fff', 
                padding: 8, 
                borderRadius: 50, 
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                maxWidth: 500
              }}>
                <Input 
                  prefix={<EnvironmentOutlined style={{ color: '#ff4d4f' }} />} 
                  placeholder="Enter delivery address..." 
                  bordered={false}
                  style={{ flex: 1, padding: '8px 16px' }}
                />
                <Button 
                  type="primary" 
                  size="large" 
                  shape="round" 
                  style={{ height: 48, padding: '0 32px', fontWeight: 600, background: '#ff4d4f' }}
                  onClick={() => router.push('/buyer/dashboard')}
                >
                  Explore
                </Button>
              </div>
            </Col>
            
            <Col xs={24} lg={12} style={{ position: 'relative', textAlign: 'center' }}>
               {/* Premium Visual elements */}
               <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 400 }}>
                 <Card style={{ 
                   position: 'absolute', top: '10%', right: '10%', width: 200, zIndex: 2, borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: 'none'
                 }} bodyStyle={{ padding: 12 }}>
                   <Space align="start">
                     <Avatar style={{ background: '#52c41a' }} icon={<StarFilled />} />
                     <div>
                        <Text strong>Top Rated</Text><br/>
                        <Text type="secondary">4.9 (2k+ reviews)</Text>
                     </div>
                   </Space>
                 </Card>

                 <Card style={{ 
                   position: 'absolute', bottom: '15%', left: '5%', width: 180, zIndex: 2, borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: 'none'
                 }} bodyStyle={{ padding: 12 }}>
                   <Space align="start">
                     <Badge status="processing" color="red" />
                     <div>
                        <Text strong>Live Tracking</Text><br/>
                        <Text type="secondary">On the way...</Text>
                     </div>
                   </Space>
                 </Card>

                 <img 
                   src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop" 
                   alt="Delicious food"
                   style={{ width: '100%', borderRadius: 30, boxShadow: '0 30px 60px rgba(0,0,0,0.15)', transform: 'rotate(-2deg)' }}
                 />
               </div>
            </Col>
          </Row>
        </div>

        {/* Featured Dishes */}
        <div style={{ padding: '80px clamp(16px, 5vw, 120px)', background: '#fafafa' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
              <div>
                <Title level={2} style={{ margin: 0 }}>Featured Dishes</Title>
                <Text type="secondary">Handpicked favorites delivered to your door</Text>
              </div>
              <Link href="/buyer/dashboard">
                <Button type="link" style={{ color: '#ff4d4f', fontWeight: 600 }}>Explore More <ArrowRightOutlined /></Button>
              </Link>
           </div>
           <Row gutter={[24, 24]} justify="center">
             {items.map((item, idx) => (
               <Col xs={24} sm={12} md={12} lg={8} key={idx}>
                 <Card 
                  hoverable 
                  cover={<img alt={item.name} src={item.image_url || `https://picsum.photos/seed/${item.id}/400/250`} style={{ height: 200, objectFit: 'cover' }} />}
                  style={{ borderRadius: 16, overflow: 'hidden', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                  onClick={() => router.push(`/buyer/dashboard?item=${item.id}`)}
                 >
                   <Card.Meta 
                    title={item.name} 
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Text type="secondary">{item.description?.slice(0, 60)}...</Text>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                          <Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>${item.price}</Text>
                          <Tag color="orange">{item.category?.name || 'Popular'}</Tag>
                        </div>
                      </Space>
                    }
                   />
                 </Card>
               </Col>
             ))}
           </Row>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#141414', color: '#fff', padding: '60px 0' }}>
        <Title level={3} style={{ color: '#fff', marginBottom: 24 }}>Fast-Feast</Title>
        <Space size="large" style={{ marginBottom: 32 }}>
          <Text style={{ color: '#999' }}>About Us</Text>
          <Text style={{ color: '#999' }}>Partner with Us</Text>
          <Text style={{ color: '#999' }}>Terms of Service</Text>
          <Text style={{ color: '#999' }}>Contact</Text>
        </Space>
        <div style={{ color: '#666' }}>
          Fast-Feast Marketplace ©{new Date().getFullYear()} Created with ❤️ for Foodies
        </div>
      </Footer>
    </Layout>
  );
}
