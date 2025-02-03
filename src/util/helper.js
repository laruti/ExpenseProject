
const { config } = require("./config");
const connection = require("./connection");
const { logError } = require("./logerror");
const multer = require("multer")
const fs = require("fs/promises");
const path = require("path");
const { error } = require("console");

exports.db = connection;
exports.logError = logError;
exports.toInt = () =>{
    return true
}
exports.isArray = (data) =>{
    return true
}
exports.isEmty = (data) =>{
    return true
}
exports.isEmail = (data) =>{
    return true
}
exports.toInt = () =>{
    return true
}

exports.upload = multer({
    storage: multer.diskStorage({
      destination: function (req,file,callback){
        callback(null,config.image_path) 
      },
      filename: function (req,file,callback){
        const uniquesSuffix = Date.now() + "-" + Math.round(Math.random()* 1e9);
        callback(null,file.fieldname + "-" + uniquesSuffix + "" + file.originalname)
      }
    }),
    limits:{
      fileSize:1024 * 1024 * 3
    },
    fileFilter: function (req,file,callback){
      if(file.mimetype!= "image/png" && file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg"){
        callback(null,false)
      }else{
        callback(null,true)
      }
    }
  })
  
  exports.isEmptyOrNull = (value) => {
    if (value === "" || value === null || value === "null" || value === undefined || value === "undefined") {
        return true;
    }
    return false;
}
  
  exports.removeF = async (fileName) => {
    try {
      const filePath = path.join(config.image_path, fileName);
      
      // Check if the file exists before trying to delete it
      // const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);

      if (fileExists) {
        await fs.unlink(filePath);
        console.log("File deleted successfully");
      } else {
        console.log("File does not exist, no need to delete");
      }
  
      return "Delete success";
    } catch (error) {
      console.error("Error deleting file", error);
      throw error;
    }
  };

