import mongoose from  "mongoose";

const ConnectDB = async ()=>{
  try {
     const connectedDB = await mongoose.connect(`${process.env.MONGODB_URI}/whatsapp-clone`);
     console.log("Mongo Database Connected Successfully",`${connectedDB.connection.host}`); 
  } catch (error) {
    console.log("error connecting database",error.massage);
    process.exit(1)
  }
}

export default ConnectDB