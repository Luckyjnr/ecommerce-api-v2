/**
 * Payment simulation utility
 * Simulates payment processing with 80% success rate
 */

const simulatePayment = (paymentData) => {
  return new Promise((resolve, reject) => {
    // Simulate processing delay
    setTimeout(() => {
      // 80% success rate
      const isSuccess = Math.random() < 0.8;
      
      if (isSuccess) {
        resolve({
          success: true,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: 'Payment processed successfully',
          amount: paymentData.amount,
          currency: paymentData.currency || 'USD',
          timestamp: new Date().toISOString()
        });
      } else {
        reject({
          success: false,
          error: 'Payment failed',
          message: 'Payment could not be processed. Please try again.',
          code: 'PAYMENT_FAILED',
          timestamp: new Date().toISOString()
        });
      }
    }, 2000); // 2 second delay to simulate processing
  });
};

const validatePaymentData = (paymentData) => {
  const errors = [];
  
  if (!paymentData.amount || paymentData.amount <= 0) {
    errors.push('Invalid amount');
  }
  
  if (!paymentData.paymentMethod) {
    errors.push('Payment method is required');
  }
  
  if (!paymentData.cardNumber && paymentData.paymentMethod === 'credit_card') {
    errors.push('Card number is required for credit card payments');
  }
  
  if (!paymentData.expiryDate && paymentData.paymentMethod === 'credit_card') {
    errors.push('Expiry date is required for credit card payments');
  }
  
  if (!paymentData.cvv && paymentData.paymentMethod === 'credit_card') {
    errors.push('CVV is required for credit card payments');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  simulatePayment,
  validatePaymentData
};
