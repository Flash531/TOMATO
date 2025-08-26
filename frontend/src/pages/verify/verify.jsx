import React, { useContext, useEffect } from 'react';
import './verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  // Try to get either 'orderid' or 'orderId' param
  const orderId = searchParams.get('orderid') || searchParams.get('orderId');
  const { url } = useContext(StoreContext);

  const navigate = useNavigate();

  console.log('Payment success:', success);
  console.log('Order ID:', orderId);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        console.error('No orderId found in URL query params');
        navigate('/'); // Redirect or show error page
        return;
      }
      try {
        const response = await axios.post(url + '/api/order/verify', { success, orderId });
        if (response.data.success) {
          navigate('/myorders');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        navigate('/');
      }
    };

    verifyPayment();
  }, [orderId, success, navigate, url]);

  return (
    <div className="verify">
      <div className="spinner"></div>
    </div>
  );
};

export default Verify;