import cloudinary from './cloudinary.js';
import { deletePhotoFromDatabase, savePhotoToDatabase } from './photoController.js';
import { deleteVideoFromDatabase, saveVideoToDatabase } from './videoController.js';

export const createCloudinary = async (req, res) => {
  try {
    const { files } = req.body;
    console.log('FILES==>',files);

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: 'No se enviaron archivos.' });
    }

    const results = [];

    for (const fileData of files) {
      const { name, description, file, type, folder } = fileData;

      const uploaded = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: type,
        public_id: name.split('.')[0],
      });

      if (!uploaded) {
        results.push({ name, status: 'error', message: 'Falló la subida a Cloudinary' });
        continue;
      }

      let dbSaved;

      if (type === 'image') {
        dbSaved = await savePhotoToDatabase({
          name,
          description,
          img: uploaded.secure_url,
          type,
          folder,
        });
      } else if (type === 'video') {
        dbSaved = await saveVideoToDatabase({
          name,
          description,
          video: uploaded.secure_url,
          type,
          folder,
        });
      }

      results.push({
        name,
        status: 'success',
        cloudinary: uploaded,
        database: dbSaved,
      });
    }

    return res.status(201).json({
      message: 'Carga finalizada',
      results,
    });
  } catch (error) {
    console.error('Error en createCloudinary:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};
export const deleteFromCloudinary = async (req, res) => {
  try {
    const { public_id, type, folder } = req.body;

    if (!public_id || !type || !folder) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    const fullPublicId = `${folder}/${public_id}`;

    // Eliminar de Cloudinary
    const cloudinaryDeleted = await cloudinary.uploader.destroy(fullPublicId, {
      resource_type: type,
    });

    if (cloudinaryDeleted.result !== 'ok' && cloudinaryDeleted.result !== 'not_found') {
      return res.status(500).json({
        message: 'Error al eliminar el archivo de Cloudinary',
        result: cloudinaryDeleted,
      });
    }

    // Eliminar de base de datos
    let dbResult;
    if (type === 'image') {
      dbResult = await deletePhotoFromDatabase(public_id);
    } else if (type === 'video') {
      dbResult = await deleteVideoFromDatabase(public_id);
    } else {
      return res.status(400).json({ message: 'Tipo inválido: debe ser "image" o "video"' });
    }

    return res.status(200).json({
      message: 'Archivo eliminado correctamente',
      cloudinary: cloudinaryDeleted,
      database: dbResult,
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error.message);
    return res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};
// export const createCloudinary           = async (req, res) => {
//     try {
//         const { name, description, file, type, folder } = req.body;
//         console.log("Received data:", req.body);
        
//         const cloudinaryCreated = await cloudinary.uploader.upload(file, {
//             folder,
//             resource_type: type,
//             public_id: name.split('.')[0],
//         });
//         if (!cloudinaryCreated)
//             return res.status(401).send({ message: "The Photo has not been created." });
       
//         if(type === 'image'){
//                 const dbSaved = await savePhotoToDatabase({
//                 name,
//                 description,
//                 img: cloudinaryCreated.secure_url,
//                 type,
//                 folder,
//             });
//             return res.status(200).json({
//                 message: "Imagen subida y guardada.",
//                 cloudinary: cloudinaryCreated,
//                 database: dbSaved,
//             });
    
//         }
//         else if(type === 'video'){
//             const dbSaved = await saveVideoToDatabase({
//                 name,
//                 description,
//                 video: cloudinaryCreated.secure_url,
//                 type,
//                 folder,
//             });
//             return res.status(200).json({
//                 message: "Video subido y guardado.",
//                 cloudinary: cloudinaryCreated,
//                 database: dbSaved,
//             });

//         }
//         //  res.status(200).send({
//         //     message: "You created this photo.",
//         //     cloudinaryCreated,
//         // });
//     } catch (error) {
//         res.status(409).json({ message: error.message });
//         console.log(error.message, "error");
//     }
// }