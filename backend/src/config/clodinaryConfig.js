import {v2} from 'cloudinary'
import fs from 'fs'

v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

export const uploadFiletoClodinary = (file)=>{
    const options = {
        resource_type: file?.mimetype?.startsWith("video") ? "video" : "image"
    }
    return new Promise((resolve,reject)=>{
        const uploader = file?.mimetype?.startsWith('video') ? v2.uploader.upload_large : v2.uploader.upload;
        uploader(file.path,options,(error,result)=>{
            fs.unlink(file.path,()=>{})
            if(error){
            return reject(error)
            }
            resolve(result)
        })
    })
}

