'use client';

import React, { useState } from 'react';
import { Drawer, List, Button, Typography, Space, Divider, Empty, message, Radio, Row, Col } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined, CreditCardOutlined, DollarOutlined } from '@ant-design/icons';
import { useCart } from '@/lib/CartContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function CartSidebar() {
  const { cart, removeFromCart, addToCart, total, isOpen, setIsOpen, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'COD'>('STRIPE');
  const [checkingOut, setCheckingOut] = useState(false);
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

    setCheckingOut(true);
    try {
      const orderData = {
        shop_id: cart[0].shop_id,
        delivery_address: "Default Address",
        items: cart.map(i => ({ food_item_id: i.id, quantity: i.quantity })),
        payment_method: paymentMethod
      };
      
      const response = await api.post('/orders', orderData);
      
      if (response.data.checkout_url && paymentMethod === 'STRIPE') {
        message.loading('Redirecting to secure payment...', 1.5);
        window.location.href = response.data.checkout_url;
      } else {
        message.success('Order placed successfully! (Cash on Delivery)');
        clearCart();
        setIsOpen(false);
        router.push('/buyer/orders');
      }
    } catch (error) {
      message.error('Failed to place order');
    } finally {
      setCheckingOut(false);
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
          
          <div style={{ padding: '24px 0 0', background: '#fff' }}>
            <Divider style={{ margin: '0 0 16px' }}>Payment Method</Divider>
            <Radio.Group 
              onChange={(e) => setPaymentMethod(e.target.value)} 
              value={paymentMethod}
              style={{ width: '100%', marginBottom: 24 }}
            >
              <Row gutter={12}>
                <Col span={12}>
                  <Radio.Button value="STRIPE" style={{ width: '100%', height: 'auto', padding: '10px', textAlign: 'center' }}>
                    <CreditCardOutlined style={{ fontSize: 18, display: 'block', marginBottom: 4 }} /><Text>Card</Text>
                  </Radio.Button>
                </Col>
                <Col span={12}>
                  <Radio.Button value="COD" style={{ width: '100%', height: 'auto', padding: '10px', textAlign: 'center' }}>
                    <DollarOutlined style={{ fontSize: 18, display: 'block', marginBottom: 4 }} /><Text>Cash</Text>
                  </Radio.Button>
                </Col>
              </Row>
            </Radio.Group>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <Title level={4}>Total</Title>
              <Title level={4} style={{ color: '#ff4d4f' }}>${total.toFixed(2)}</Title>
            </div>
            
            <Button 
              type="primary" 
              size="large" 
              block 
              loading={checkingOut}
              onClick={handleCheckout}
              style={{ height: 50, borderRadius: 8 }}
            >
              {paymentMethod === 'STRIPE' ? 'Pay Now' : 'Confirm Order (CoD)'}
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}

import { Typography as AntTypography } from 'antd';
const { Text: AntText } = AntTypography;
