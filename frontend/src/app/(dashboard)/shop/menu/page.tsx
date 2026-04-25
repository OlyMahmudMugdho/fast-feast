'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Table, Space, Modal, Form, Input, InputNumber, Select, Upload, message, Popconfirm, Tag, Switch } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title } = Typography;
const { Option } = Select;

export default function ShopMenuManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
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

  const handleOpenItemModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      itemForm.setFieldsValue({
        name: item.name,
        description: item.description,
        price: item.price,
        category_id: item.category_id,
        is_available: item.is_available
      });
    } else {
      setEditingItem(null);
      itemForm.resetFields();
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (values: any) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('price', values.price.toString());
    formData.append('category_id', values.category_id);
    formData.append('is_available', values.is_available === undefined ? 'true' : values.is_available.toString());
    
    if (values.image?.file) {
      formData.append('image', values.image.file);
    }

    try {
      if (editingItem) {
        await api.patch(`/shops/me/items/${editingItem.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Food item updated');
      } else {
        await api.post('/shops/me/items', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Food item created');
      }
      setIsItemModalOpen(false);
      fetchData();
    } catch (error) {
      message.error('Failed to save food item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.delete(`/shops/me/items/${id}`);
      message.success('Item deleted');
      fetchData();
    } catch (error) {
      message.error('Failed to delete item');
    }
  };

  const itemColumns = [
    { title: 'Image', dataIndex: 'image_url', key: 'img', render: (url: string) => <img src={url} alt="dish" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} /> },
    { title: 'Name', dataIndex: 'name', key: 'name', render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span> },
    { title: 'Category', dataIndex: 'category_id', key: 'cat', render: (id: string) => categories.find((c: any) => c.id === id)?.name || 'N/A' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (p: string) => <Tag color="green">${p}</Tag> },
    { title: 'Status', dataIndex: 'is_available', key: 'status', render: (s: boolean) => s ? <Tag color="blue">Available</Tag> : <Tag color="red">Sold Out</Tag> },
    { title: 'Action', key: 'action', render: (_: any, record: any) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => handleOpenItemModal(record)} size="small" />
        <Popconfirm title="Delete this item?" onConfirm={() => handleDeleteItem(record.id)} okText="Yes" cancelText="No">
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Menu Management</Title>
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => setIsCatModalOpen(true)}>Add Category</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenItemModal()}>Add Food Item</Button>
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

      <Modal title={editingItem ? "Edit Food Item" : "Add Food Item"} open={isItemModalOpen} onCancel={() => setIsItemModalOpen(false)} onOk={() => itemForm.submit()} width={600}>
        <Form form={itemForm} onFinish={handleSaveItem} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Classic Margherita" />
          </Form.Item>
          <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
            <Select>
              {categories.map((c: any) => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Price ($)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_available" label="Available" initialValue={true}>
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>Sold Out</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Describe the ingredients and taste..." />
          </Form.Item>
          <Form.Item name="image" label="Dish Image" extra="Leave empty to keep current image if editing">
            <Upload beforeUpload={() => false} maxCount={1} listType="picture">
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
