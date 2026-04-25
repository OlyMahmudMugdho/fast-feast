'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, message, Card, Button, Modal, Form, Input, Space } from 'antd';
import { UserAddOutlined, TeamOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;

export default function ShopEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/shops/me/employees');
      setEmployees(response.data);
    } catch (error) {
      message.error('Failed to fetch staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      await api.post('/shops/me/employees', values);
      message.success('Staff member added successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchEmployees();
    } catch (error) {
      message.error('Failed to add staff member');
    }
  };

  const columns = [
    { title: 'Full Name', dataIndex: 'full_name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (p: string) => p || 'N/A' },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => <Tag color="blue">{role}</Tag>
    },
    { 
      title: 'Status', 
      dataIndex: 'is_active', 
      key: 'status',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'ACTIVE' : 'INACTIVE'}</Tag>
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}><TeamOutlined /> Shop Staff</Title>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalOpen(true)}>
          Add Staff Member
        </Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table 
          dataSource={employees} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
        />
      </Card>

      <Modal 
        title="Add Staff Member" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Create Account"
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
            <Input prefix={<TeamOutlined />} placeholder="e.g. Michael Server" />
          </Form.Item>
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="staff@yourshop.com" />
          </Form.Item>
          <Form.Item name="phone" label="Phone Number">
            <Input prefix={<PhoneOutlined />} placeholder="1234567890" />
          </Form.Item>
          <Form.Item name="password" label="Initial Password" rules={[{ required: true, min: 8 }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Min 8 characters" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
