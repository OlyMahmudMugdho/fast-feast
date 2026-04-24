'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Space, Dropdown, Avatar, Drawer } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  TeamOutlined,
  LoginOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const PUBLIC_PATHS = ['/buyer/dashboard', '/buyer/shop', '/buyer/item'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const storedRole = localStorage.getItem('role');
    const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

    if (!storedRole && !isPublicPath) {
      router.push('/login');
    } else {
      setRole(storedRole);
      setIsReady(true);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const getMenuItems = () => {
    const baseItems = [];
    
    if (!role) {
      baseItems.push(
        { key: '/', icon: <HomeOutlined />, label: 'Home' },
        { key: '/buyer/dashboard', icon: <ShopOutlined />, label: 'Browse Food' }
      );
    } else if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      baseItems.push(
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Overview' },
        { key: '/admin/shops', icon: <ShopOutlined />, label: 'Verify Shops' },
        { key: '/admin/employees', icon: <TeamOutlined />, label: 'Admin Team' }
      );
    } else if (role === 'SHOP_OWNER' || role === 'SHOP_EMPLOYEE') {
      baseItems.push(
        { key: '/shop/dashboard', icon: <DashboardOutlined />, label: 'Overview' },
        { key: '/shop/menu', icon: <ShopOutlined />, label: 'Menu' },
        { key: '/shop/orders', icon: <ShoppingOutlined />, label: 'Orders' },
        { key: '/shop/employees', icon: <TeamOutlined />, label: 'Staff' }
      );
    } else {
      baseItems.push(
        { key: '/buyer/dashboard', icon: <DashboardOutlined />, label: 'Browse' },
        { key: '/buyer/orders', icon: <ShoppingOutlined />, label: 'My Orders' },
        { key: '/buyer/profile', icon: <UserOutlined />, label: 'Profile' }
      );
    }
    return baseItems;
  };

  const menu = (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={[pathname]}
      items={getMenuItems()}
      onSelect={({ key }) => {
        router.push(key);
        setMobileVisible(false);
      }}
    />
  );

  if (!isReady) return null;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile ? (
        <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)', position: 'fixed', left: 0, height: '100vh', zIndex: 1001 }}>
          <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>
              {collapsed ? 'FF' : 'Fast-Feast'}
            </Title>
          </div>
          {menu}
        </Sider>
      ) : (
        <Drawer
          placement="left"
          onClose={() => setMobileVisible(false)}
          open={mobileVisible}
          width={250}
          bodyStyle={{ padding: 0 }}
          title={<span style={{ color: '#ff4d4f', fontWeight: 800 }}>Fast-Feast</span>}
        >
          {menu}
        </Drawer>
      )}
      
      <Layout style={{ marginLeft: !isMobile ? (collapsed ? 80 : 200) : 0, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%'
        }}>
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setMobileVisible(true) : setCollapsed(!collapsed)}
            style={{ fontSize: '18px', width: 64, height: 64 }}
          />
          <Space size="middle">
            {role ? (
              <Dropdown
                menu={{
                  items: [
                    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
                  ],
                }}
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} />
                  <Text strong className="hide-mobile">{role}</Text>
                </Space>
              </Dropdown>
            ) : (
              <Link href="/login">
                <Button type="primary" icon={<LoginOutlined />} shape="round">Login</Button>
              </Link>
            )}
          </Space>
        </Header>
        <Content style={{ margin: 'clamp(12px, 2vw, 24px)', padding: 'clamp(12px, 2vw, 24px)', background: '#fff', borderRadius: 8, minHeight: 280 }}>
          {children}
        </Content>
      </Layout>

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
