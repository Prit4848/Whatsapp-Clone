const response = (res,statusCode,message,data)=>{
    if(!res){
        console.error("Response Object Is Null");  
    }

    const responseObject = {
        status:statusCode < 400 ? "success" : "error",
        message,
        data
    }

    return res.status(statusCode).json(responseObject)
}

export {response}