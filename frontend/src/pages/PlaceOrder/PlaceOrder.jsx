import axios from 'axios';
import React, { useContext, useEffect,useState } from 'react'
import './PlaceOrder.css'
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext'

const url = "http://localhost:4000";



const PlaceOrder = () => {


  const { getTotalCartAmount, token, food_list, cartItems, setCartItems } = useContext(StoreContext)

  const [data,setData] = useState({  
    firstname:"",
    lastname:"",
    email:"",
    street:"",
    city:"",
    state:"",
    zipcode:"",
    country:"",
    phone:""
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data=>({...data,[name]:value}))

  }

  // useEffect(()=>{
  //   console.log(data);
    
  // },[data])

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    food_list.map((item)=>{
      if(cartItems[item._id] > 0){
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id]
        orderItems.push(itemInfo)
      }
    })

    let orderData = {
      address:data,
      items:orderItems,
      amount:getTotalCartAmount()+2,
    }
    let response = await axios.post(url+"/api/order/place",orderData,{headers:{token}});
    if(response.data.success)
    {
      const {session_url} = response.data; 
      window.location.replace(session_url);    }
    else{
      alert("Error");
    }
  }

  const placeCODOrder = async () => {
    // Check if all delivery fields are filled
    for (let key in data) {
      if (data[key].trim() === "") {
        alert("Please fill all delivery information fields before placing an order.");
        return;
      }
    }
    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
      paymentMethod: "COD"
    };

    try {
      let response = await axios.post(url + "/api/order/place-cod", orderData, { headers: { token } });
      if (response.data.orderId) {
        const paymentSuccess = response.data.success ? "true" : "false";
        navigate(`/verify?success=${paymentSuccess}&orderId=${response.data.orderId}`);
        setTimeout(() => {
          setCartItems({});
        }, 200);
      } else {
        alert("Error");
      }
    } catch (error) {
      alert("Order failed. Please try again.");
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if(!token){
      navigate('/cart')
    }
    else if(getTotalCartAmount()===0)
    {
      navigate('/cart')
    }
      
  }, [token, getTotalCartAmount])



  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        {/* <p style={{color:'red' ,fontSize: '20px', fontWeight: '600' }}>Delivery Information</p> */}

        <div className="multi-fields">
          <input required name='firstname' onChange={onChangeHandler} value={data.firstname}type="text" placeholder='First name'/>
          <input required name='lastname' onChange={onChangeHandler} value={data.lastname}type="text" placeholder='Last name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email}type="email" placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street}type="text" placeholder='Street'/>
      
      <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city}type="text" placeholder='City'/>
          <input required name='state' onChange={onChangeHandler} value={data.state}type="text" placeholder='State' />
      </div>
      <div className="multi-fields">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode}type="text" placeholder='Zipcode'/>
          <input required name='country' onChange={onChangeHandler} value={data.country}type="text" placeholder='Country' />
       </div>
       <input required name='phone' onChange={onChangeHandler} value={data.phone}type="text" placeholder='Phone' />
       </div>



      <div className="place-order-right">
      <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
          <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount()===0?0:2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount()===0?0:getTotalCartAmount()+2}</b>
            </div>
          </div>
          <div className="payment-options">
            <button type="submit">PROCEED TO PAYMENT</button>
            <button type="button" onClick={placeCODOrder}>CASH ON DELIVERY</button>
          </div>
        </div>


      </div>

    </form>
  )
}

export default PlaceOrder