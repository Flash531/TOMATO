import mongoose from "mongoose"

 export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://PumpkinPie:yummysomuch@cluster0.mtr6d39.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}