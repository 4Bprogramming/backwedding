import { v2 as cloudinary } from'cloudinary';
const {
    CLOUDNAME, APIKEY, SECRET } = process.env;
cloudinary.config({
  cloud_name: CLOUDNAME,
  api_key: APIKEY,
  api_secret: SECRET,
});

export default cloudinary;