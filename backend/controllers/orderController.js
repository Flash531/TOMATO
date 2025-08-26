import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe" 

const stripe=new Stripe(process.env.STRIPE_SECRET_KEY)


//Placing user order form frontend 

const placeOrder = async (req,res) => {

    const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173"
    try {
        const newOrder = new orderModel({
            userId:req.body.userId,
            items:req.body.items,
            amount:req.body.amount,
            address:req.body.address,
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});

        //stripe payments link
        const line_items = req.body.items.map((item)=>({
            price_data:{
                currency:"inr",
                product_data:{
                    name:item.name
                },
                unit_amount:item.price*100*80
            },
            quantity:item.quantity
        }))

        line_items.push({
            price_data:{
                currency:"inr",
                product_data:{
                    name:"Delivery Charges"
                },
                unit_amount:2*100*80
            },
            quantity:1
        })

        const session = await stripe.checkout.sessions.create({
            line_items:line_items,
            mode:'payment',
            success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`

        })
        res.json({success:true,session_url:session.url})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  console.log("verifyOrder input:", { orderId, success });

  try {
    if (success == "true") {
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        { payment: true },
        { new: true }
      );

      if (!updatedOrder) {
        console.log("Order not found:", orderId);
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      console.log("Order after update:", updatedOrder);
      res.json({ success: true, message: "Payment marked as true", order: updatedOrder });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Order deleted due to failed payment" });
    }
  } catch (error) {
    console.error("Error in verifyOrder:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete all unpaid orders (payment: false)
const deleteUnpaidOrders = async (req, res) => {
  try {
    const result = await orderModel.deleteMany({ payment: false });
    res.json({ success: true, message: `Deleted ${result.deletedCount} unpaid orders.` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to delete unpaid orders" });
  }
};

//user orders for frontend

const userOrders = async (req,res) =>  {
    try {
        const orders = await orderModel.find({userId:req.body.userId});
        res.json({success:true,data:orders})
    } catch (error) {

        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//Listing order for admin panel

const listOrders = async(req,res) => {
  try {
    const orders = await orderModel.find({});
    res.json({success:true,data:orders})
  } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
  }
} 

//api for updating order status

const updateStatus = async(req,res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
    res.json({success:true,message:"Status Updated"})
  } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})    
  }
}


// Place Cash on Delivery (COD) order
const placeCODOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
  try {
    const userId = req.body.userId;
    const newOrder = new orderModel({
      userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: true,
      paymentMethod: "COD"
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    console.log(`Cart cleared for user: ${userId}`);

    res.json({ success: true, orderId: newOrder._id });
  } catch (error) {
    console.log("COD Order Error:", error);
    res.status(500).json({ success: false, message: "Could not place COD order" });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  deleteUnpaidOrders,
  listOrders,
  updateStatus,
  placeCODOrder
}