import { useState } from 'react';
import axios from 'axios';
import React, { useContext, useEffect } from 'react'
import { StoreContext } from '../../context/StoreContext';
import './MyOrders.css'
import { assets } from '../../assets/frontend_assets/assets';

const MyOrders = () => {


    const { url, token } = useContext(StoreContext);
    const [data,setData] = useState([]);

    const fetchOrders= async () => {
        const response = await axios.post(url+"/api/order/userorders",{},{headers:{token}});
        setData(response.data.data);
        // console.log(response.data.data)
    }

    useEffect(()=>{
        if(token){
            fetchOrders();
        }
    },[token])






  return (
    <div className='my-orders'>
        <h2>My Orders</h2>
        <div className='container'>
            {data.map((order,index)=>{
                return(
                    <div key={index} className='my-orders-order'>
                        {/* <h4>{new Date(order.date).toLocaleString()}</h4> */}
                        <img src={assets.parcel_icon} alt="" />
                        <p>{order.items.map((item,index)=>{
                            if(index === order.items.length-1){
                                return item.name+" x "+ item.quantity
                            }
                            else{
                                return item.name+" x "+ item.quantity+" , "
                            }
                        
                        })}</p>
                        <p>${order.amount.toFixed(2)}</p>
                        {/* <p>Unique Items: {order.items.length}</p> */}
                        <p>Total Item: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                        {/* <p>Status: {order.status}</p> */}
                        <p><span>&#x25cf;</span><b>{order.status}</b></p>
                        <button onClick={() => fetchOrders(order._id)}>Track Order</button>
                    </div>
                )
            })}
        </div>
        </div >
  )
}

export default MyOrders