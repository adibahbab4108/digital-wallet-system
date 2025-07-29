import dotenv from "dotenv"
dotenv.config()

export const envVars = {
    PORT: process.env.PORT as string,
    MONGO_URI:process.env.MONGODB_URI as string
}