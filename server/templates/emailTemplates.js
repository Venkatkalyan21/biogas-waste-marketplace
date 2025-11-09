// Email templates for notifications

const baseTemplate = (title, content, buttonText, buttonUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #15803d; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .button { display: inline-block; padding: 12px 24px; background: #15803d; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AgriLoop</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
      ${buttonText && buttonUrl ? `<a href="${buttonUrl}" class="button">${buttonText}</a>` : ''}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AgriLoop. All rights reserved.</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

const templates = {
  orderPlaced: (order, buyerName) => {
    const title = 'New Order Received';
    const content = `
      <p>Hello ${buyerName || 'Supplier'},</p>
      <p>You have received a new order!</p>
      <p><strong>Order Number:</strong> ${order.orderNumber || order._id}</p>
      <p><strong>Buyer:</strong> ${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}</p>
      <p><strong>Total Amount:</strong> ₹${order.totalPrice?.amount || 0}</p>
      <p>Please log in to your dashboard to view and manage the order.</p>
    `;
    return baseTemplate(title, content, 'View Order', `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}`);
  },

  orderStatusUpdated: (order, status, userName) => {
    const title = 'Order Status Updated';
    const content = `
      <p>Hello ${userName || 'User'},</p>
      <p>Your order status has been updated.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber || order._id}</p>
      <p><strong>New Status:</strong> ${status}</p>
      <p>Please log in to view more details.</p>
    `;
    return baseTemplate(title, content, 'View Order', `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}`);
  },

  passwordReset: (resetToken, userName) => {
    const title = 'Password Reset Request';
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const content = `
      <p>Hello ${userName || 'User'},</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    return baseTemplate(title, content, 'Reset Password', resetUrl);
  },

  emailVerification: (verificationToken, userName) => {
    const title = 'Verify Your Email';
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    const content = `
      <p>Hello ${userName || 'User'},</p>
      <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
    `;
    return baseTemplate(title, content, 'Verify Email', verifyUrl);
  },

  paymentReceived: (order, sellerName) => {
    const title = 'Payment Received';
    const content = `
      <p>Hello ${sellerName || 'Supplier'},</p>
      <p>Payment has been received for your order!</p>
      <p><strong>Order Number:</strong> ${order.orderNumber || order._id}</p>
      <p><strong>Amount:</strong> ₹${order.totalPrice?.amount || 0}</p>
      <p>Payment is being held in escrow until delivery is confirmed.</p>
    `;
    return baseTemplate(title, content, 'View Order', `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}`);
  },

  escrowReleased: (order, sellerName) => {
    const title = 'Escrow Released';
    const content = `
      <p>Hello ${sellerName || 'Supplier'},</p>
      <p>Escrow has been released for your completed order!</p>
      <p><strong>Order Number:</strong> ${order.orderNumber || order._id}</p>
      <p><strong>Amount:</strong> ₹${order.totalPrice?.amount || 0}</p>
      <p>Funds will be transferred to your account shortly.</p>
    `;
    return baseTemplate(title, content, 'View Order', `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}`);
  }
};

module.exports = templates;

