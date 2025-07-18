import { shopifyApi, ApiVersion, Session } from '@shopify/shopify-api';
import { restResources } from '@shopify/shopify-api/rest/admin/2024-01';

// Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: ['read_products', 'write_products', 'read_orders', 'write_orders', 'read_checkouts', 'write_checkouts'],
  hostName: process.env.SHOPIFY_APP_URL?.replace(/https?:\/\//, '') || 'localhost:3000',
  hostScheme: 'https',
  apiVersion: ApiVersion.January24,
  isEmbeddedApp: true,
  restResources,
});

// Create a session for API calls
export function createSession(accessToken: string): Session {
  return new Session({
    id: `offline_${process.env.SHOPIFY_STORE_DOMAIN}`,
    shop: process.env.SHOPIFY_STORE_DOMAIN!,
    state: '',
    isOnline: false,
    accessToken,
    scope: 'read_products,write_products,read_orders,write_orders,read_checkouts,write_checkouts',
  });
}

// Product management functions
export async function createProduct(session: Session, productData: any) {
  const client = new shopify.clients.Rest({ session });
  
  try {
    const response = await client.post({
      path: 'products',
      data: {
        product: productData,
      },
    });
    return response.body;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function getProduct(session: Session, productId: string) {
  const client = new shopify.clients.Rest({ session });
  
  try {
    const response = await client.get({
      path: `products/${productId}`,
    });
    return response.body;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function updateProduct(session: Session, productId: string, productData: any) {
  const client = new shopify.clients.Rest({ session });
  
  try {
    const response = await client.put({
      path: `products/${productId}`,
      data: {
        product: productData,
      },
    });
    return response.body;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Cart and checkout functions
export async function createCheckout(session: Session, lineItems: any[]) {
  const client = new shopify.clients.Rest({ session });
  
  try {
    const response = await client.post({
      path: 'checkouts',
      data: {
        checkout: {
          line_items: lineItems,
        },
      },
    });
    return response.body;
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw error;
  }
}

// Order management functions
export async function getOrder(session: Session, orderId: string) {
  const client = new shopify.clients.Rest({ session });
  
  try {
    const response = await client.get({
      path: `orders/${orderId}`,
    });
    return response.body;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

export async function getOrders(session: Session, limit = 50) {
  const client = new shopify.clients.Rest({ session });
  
  try {
    const response = await client.get({
      path: 'orders',
      query: { limit: limit.toString() },
    });
    return response.body;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// Webhook verification
export function verifyWebhook(data: string, hmacHeader: string): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET);
  hmac.update(data, 'utf8');
  const generatedHash = hmac.digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(generatedHash, 'base64'),
    Buffer.from(hmacHeader, 'base64')
  );
}

export { shopify }; 