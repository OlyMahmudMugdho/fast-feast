'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Space, Dropdown, Avatar } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      router.push('/login');
    } else {
      setRole(storedRole);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const getMenuItems = () => {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      return [
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Overview' },
        { key: '/admin/shops', icon: <ShopOutlined />, label: 'Verify Shops' },
        { key: '/admin/employees', icon: <TeamOutlined />, label: 'Admin Team' },
      ];
    } else if (role === 'SHOP_OWNER' || role === 'SHOP_EMPLOYEE') {
      return [
        { key: '/shop/dashboard', icon: <DashboardOutlined />, label: 'Overview' },
        { key: '/shop/menu', icon: <ShopOutlined />, label: 'Menu' },
        { key: '/shop/orders', icon: <ShoppingOutlined />, label: 'Orders' },
        { key: '/shop/employees', icon: <TeamOutlined />, label: 'Staff' },
      ];
    } else {
      return [
        { key: '/buyer/dashboard', icon: <DashboardOutlined />, label: 'Browse' },
        { key: '/buyer/orders', icon: <ShoppingOutlined />, label: 'My Orders' },
        { key: '/buyer/profile', icon: <UserOutlined />, label: 'Profile' },
      ];
    }
  };

  if (!role) return null;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>
            {collapsed ? 'FF' : 'Fast-Feast'}
          </Title>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[pathname]}
          items={getMenuItems()}
          onSelect={({ key }) => router.push(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Space size="large">
            <Dropdown
              menu={{
                items: [
                  { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
                ],
              }}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <Text strong>{role}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8, minHeight: 280, overflow: 'initial' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
