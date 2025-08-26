import express from "express"
import authMiddleware from "../middleware/auth.js"
import { placeOrder, verifyOrder, userOrders, deleteUnpaidOrders, listOrders, updateStatus, placeCODOrder } from "../controllers/orderController.js"

const orderRouter = express.Router();   

orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/place-cod", authMiddleware, placeCODOrder);
orderRouter.post("/verify",verifyOrder)
orderRouter.post("/userorders",authMiddleware,userOrders)
orderRouter.delete("/delete-unpaid", deleteUnpaidOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status",updateStatus)

export default orderRouter;