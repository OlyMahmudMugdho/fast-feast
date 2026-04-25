'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, message, Card, Button, Modal, Form, Input, Space } from 'antd';
import { UserAddOutlined, TeamOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/employees');
      setEmployees(response.data);
    } catch (error) {
      message.error('Failed to fetch admin team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      // API expects query params for this specific endpoint as implemented in admin.py
      await api.post(`/admin/employees?email=${values.email}&full_name=${values.full_name}&password=${values.password}`);
      message.success('Admin account created successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchEmployees();
    } catch (error) {
      message.error('Failed to create admin account');
    }
  };

  const columns = [
    { title: 'Full Name', dataIndex: 'full_name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => <Tag color={role === 'SUPER_ADMIN' ? 'volcano' : 'purple'}>{role}</Tag>
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
        <Title level={2}><TeamOutlined /> Admin Team</Title>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalOpen(true)}>
          Add New Admin
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
        title="Create Admin Account" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Create Account"
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
            <Input prefix={<TeamOutlined />} placeholder="e.g. John Admin" />
          </Form.Item>
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="admin@fastfeast.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Min 8 characters" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
