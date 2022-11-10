import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string
});


//Upload image to cloudinary
export const uploadImg = async(avatar: string) => {
    try {
        const result = await cloudinary.uploader.upload(avatar, {
            allowed_formats: ["png", "jpg", "jpeg", "svg"],
            public_id: "",
            folder: "airtime2Cash"
        });

        return result.secure_url;
    } catch(err) {
        console.error(err);
        return null;
    }
};


//Delete image from cloudinary
export const deleteImg = async(url: string) => {
    const parts = url.split("/").slice(-2);
    parts[1] = parts[1].split(".")[0];
    const id = parts.join('/');
    try {
        return await cloudinary.uploader.destroy(id) 
    } catch (err) {
        console.error(err);
    }
};