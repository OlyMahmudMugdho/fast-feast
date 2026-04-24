'use client';

import React from 'react';
import { Drawer, List, Button, Typography, Space, Divider, Empty, message } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useCart } from '@/lib/CartContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function CartSidebar() {
  const { cart, removeFromCart, addToCart, total, isOpen, setIsOpen, clearCart } = useCart();
  const router = useRouter();

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      message.info('Please login to place an order');
      router.push('/login');
      setIsOpen(false);
      return;
    }

    try {
      const orderData = {
        shop_id: cart[0].shop_id,
        delivery_address: "Default Address",
        items: cart.map(i => ({ food_item_id: i.id, quantity: i.quantity }))
      };
      await api.post('/orders', orderData);
      message.success('Order placed successfully! (Cash on Delivery)');
      clearCart();
      setIsOpen(false);
      router.push('/buyer/orders');
    } catch (error) {
      message.error('Failed to place order');
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <ShoppingCartOutlined style={{ color: '#ff4d4f' }} />
          <span>Your Cart</span>
        </Space>
      }
      placement="right"
      onClose={() => setIsOpen(false)}
      open={isOpen}
      width={400}
      extra={
        <Button type="link" onClick={() => clearCart()} danger disabled={cart.length === 0}>
          Clear All
        </Button>
      }
    >
      {cart.length === 0 ? (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description="Your cart is empty" 
          style={{ marginTop: 100 }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <List
            itemLayout="horizontal"
            dataSource={cart}
            style={{ flex: 1, overflowY: 'auto' }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Space key="actions">
                    <Button size="small" icon={<MinusOutlined />} onClick={() => removeFromCart(item.id)} />
                    <Text strong>{item.quantity}</Text>
                    <Button size="small" icon={<PlusOutlined />} onClick={() => addToCart(item)} />
                  </Space>
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={`$${(parseFloat(item.price) * item.quantity).toFixed(2)}`}
                />
              </List.Item>
            )}
          />
          
          <div style={{ padding: '24px 0 0' }}>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <Title level={4}>Total</Title>
              <Title level={4} style={{ color: '#ff4d4f' }}>${total.toFixed(2)}</Title>
            </div>
            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<CreditCardOutlined />}
              onClick={handleCheckout}
              style={{ height: 50, borderRadius: 8 }}
            >
              Checkout (CoD)
            </Button>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 12 }}>
              Pay in cash when your food arrives.
            </Text>
          </div>
        </div>
      )}
    </Drawer>
  );
}
