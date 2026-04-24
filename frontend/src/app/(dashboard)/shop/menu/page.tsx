'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Table, Space, Modal, Form, Input, InputNumber, Select, Upload, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title } = Typography;
const { Option } = Select;

export default function ShopMenuManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        api.get('/shops/me/categories'),
        api.get('/shops/me/items')
      ]);
      setCategories(catRes.data);
      setItems(itemRes.data);
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (values: any) => {
    try {
      await api.post('/shops/me/categories', values);
      message.success('Category created');
      setIsCatModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to create category');
    }
  };

  const handleCreateItem = async (values: any) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('price', values.price);
    formData.append('category_id', values.category_id);
    if (values.image?.file) {
      formData.append('image', values.image.file);
    }

    try {
      await api.post('/shops/me/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Food item created');
      setIsItemModalOpen(false);
      itemForm.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to create item');
    }
  };

  const itemColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category_id', key: 'cat', render: (id: string) => categories.find((c: any) => c.id === id)?.name || 'N/A' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (p: string) => `$${p}` },
    { title: 'Status', dataIndex: 'is_available', key: 'status', render: (s: boolean) => s ? 'Available' : 'Sold Out' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Menu Management</Title>
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => setIsCatModalOpen(true)}>Add Category</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsItemModalOpen(true)}>Add Food Item</Button>
        </Space>
      </div>

      <Card title="Categories" style={{ marginBottom: 32 }}>
        <Table 
          dataSource={categories} 
          columns={[{ title: 'Category Name', dataIndex: 'name', key: 'name' }, { title: 'Description', dataIndex: 'description', key: 'desc' }]} 
          rowKey="id" 
          pagination={false} 
        />
      </Card>

      <Card title="Food Items">
        <Table 
          dataSource={items} 
          columns={itemColumns} 
          rowKey="id" 
          loading={loading}
        />
      </Card>

      <Modal title="Create Category" open={isCatModalOpen} onCancel={() => setIsCatModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleCreateCategory} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Add Food Item" open={isItemModalOpen} onCancel={() => setIsItemModalOpen(false)} onOk={() => itemForm.submit()}>
        <Form form={itemForm} onFinish={handleCreateItem} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
            <Select>
              {categories.map((c: any) => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Price ($)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="image" label="Image" rules={[{ required: true }]}>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
