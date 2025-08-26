import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { food_list } from "../assets/frontend_assets/assets";


export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const[token,setToken] = useState("");
  const [food_list,setFoodList]=useState([])
  const [showLogin, setShowLogin] = useState(false);


  const addToCart = async (itemId) => {
    if (!token)
    {
      setShowLogin(true);
      return;
    }
       

    try {
      const response = await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });

      if (response.data.success) {
        setCartItems((prev) => {
          const quantity = prev?.[itemId] || 0;
          return { ...prev, [itemId]: quantity + 1 };
        });
      }
    } catch (error) {
      console.error("Failed to add item to cart", error);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!token) return;

    try {
      const response = await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });

      if (response.data.success) {
        setCartItems((prev) => {
          const quantity = prev?.[itemId] || 0;
          const updated = { ...prev };
          if (quantity <= 1) {
            delete updated[itemId];
          } else {
            updated[itemId] = quantity - 1;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to remove item from cart", error);
    }
  };

  const getTotalCartAmount = () => {
    let TotalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        TotalAmount += itemInfo.price * cartItems[item];
      }
    }
    return TotalAmount;
  };


  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      console.log("Fetched food list:", response.data);
      if (response.data?.success && Array.isArray(response.data.data)) {
        setFoodList(response.data.data);
      } else {
        setFoodList([]);
        console.warn("Unexpected food list format", response.data);
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      setFoodList([]);
    }
  }

  const loadCartData = async (token) => {
    try {
      const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
      if (response.data?.cartData) {
        setCartItems(response.data.cartData);
      } else {
        setCartItems({});
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartItems({});
    }
  };


  useEffect(()=>{
    async function loadData() {
    await fetchFoodList();
    if(localStorage.getItem("token")){
      setToken(localStorage.getItem("token"));
      await loadCartData(localStorage.getItem("token"))
  }
  }
  loadData();
},[])



  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    showLogin,
    setShowLogin
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
