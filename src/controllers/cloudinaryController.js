import { Photos } from '../models/photos.js';
import { Video } from '../models/Videos.js';
import cloudinary from './cloudinary.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import streamifier from 'streamifier';
import { deletePhotoFromDatabase, savePhotoToDatabase } from './photoController.js';
import { deleteVideoFromDatabase, saveVideoToDatabase } from './videoController.js';

// export const createCloudinary = async (req, res) => {
//   try {
//     const { files } = req.body;
//     console.log('FILES==>',files);

//     if (!Array.isArray(files) || files.length === 0) {
//       return res.status(400).json({ message: 'No se enviaron archivos.' });
//     }

//     const results = [];

//     for (const fileData of files) {
//       const { name, description, file, type, folder } = fileData;

//       const uploaded = await cloudinary.uploader.upload(file, {
//         folder,
//         resource_type: type,
//         public_id: name.split('.')[0],
//       });

//       if (!uploaded) {
//         results.push({ name, status: 'error', message: 'Falló la subida a Cloudinary' });
//         continue;
//       }

//       let dbSaved;

//       if (type === 'image') {
//         dbSaved = await savePhotoToDatabase({
//           name,
//           description,
//           img: uploaded.secure_url,
//           type,
//           folder,
//         });
//       } else if (type === 'video') {
//         dbSaved = await saveVideoToDatabase({
//           name,
//           description,
//           video: uploaded.secure_url,
//           type,
//           folder,
//         });
//       }

//       results.push({
//         name,
//         status: 'success',
//         cloudinary: uploaded,
//         database: dbSaved,
//       });
//     }

//     return res.status(201).json({
//       message: 'Carga finalizada',
//       results,
//     });
//   } catch (error) {
//     console.error('Error en createCloudinary:', error.message);
//     return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
//   }
// };
export const createCloudinary = async (req, res) => {
  try {
    const { files } = req.body;
    // console.log('FILES==>', files);

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: 'No se enviaron archivos.' });
    }

    const BATCH_SIZE = 5;
    const results = [];
    const failedFiles = [];

    const chunkArray = (arr, size) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
      );

    const uploadAndSave = async (fileData) => {
      const { name, description, file, type, folder } = fileData;

      try {
        const uploaded = await cloudinary.uploader.upload(file, {
          folder,
          resource_type: type,
          public_id: name.split('.')[0],
        });

        let dbSaved;
        if (type === 'image') {
          dbSaved = await savePhotoToDatabase({
            name,
            description,
            img: uploaded.secure_url,
            type,
            folder,
            publicId:uploaded.public_id,
          });
        } else if (type === 'video') {
          dbSaved = await saveVideoToDatabase({
            name,
            description,
            video: uploaded.secure_url,
            type,
            folder,
            publicId:uploaded.public_id,
          });
        }
console.log(`✅ [OK] Subido: ${name} → ${uploaded.public_id}`);




        return {
          name,
          status: 'success',
          cloudinary: uploaded,
          database: dbSaved,
        };
      } catch (error) {
        console.error(`❌ [ERROR] Falló: ${name} → ${error.message}`);
        return {
          name,
          status: 'error',
          message: error.message,
          originalFile: fileData,
        };
      }
    };

    // 🔄 Subir en lotes
    const batches = chunkArray(files, BATCH_SIZE);

    for (const batch of batches) {
      const batchResults = await Promise.all(batch.map(uploadAndSave));

      for (const result of batchResults) {
        if (result.status === 'success') {
          results.push(result);
        } else {
          failedFiles.push(result.originalFile);
          results.push(result);
        }
      }
    }

    // 🔁 Reintentar los que fallaron
    if (failedFiles.length > 0) {
      console.log(`🔁 Reintentando ${failedFiles.length} archivos fallidos...`);
      const retryResults = await Promise.all(failedFiles.map(uploadAndSave));

      for (const result of retryResults) {
        if (result.status === 'success') {
          console.log(`✅ [RETRY OK] Subido: ${result.name} → ${result.cloudinary.public_id}`);
          results.push({ ...result, retried: true });
        } else {
          console.error(`❌ [RETRY FAIL] ${result.name} → ${result.message}`);
          results.push({ ...result, retried: true, finalFail: true });
        }
      }
    }
     // 🧾 Log final
    const success = results.filter((r) => r.status === 'success');
    const failed = results.filter((r) => r.status === 'error' || r.finalFail);

    console.log('📦 Resumen de subida:');
    console.log(`✅ Éxitos: ${success.length}`);
    console.log(`❌ Fallidos: ${failed.length}`);
    if (failed.length > 0) {
      console.log('❗ Archivos fallidos:');
      failed.forEach((f) => console.log(`  - ${f.name}: ${f.message}`));
    }

    return res.status(201).json({
      message: 'Carga finalizada',
      retried: failedFiles.length,
      results,
    });
  } catch (error) {
    console.error('Error en createCloudinary:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// const uploadFromUrl = async (url, folder, public_id, resource_type = 'image') => {
//   const response = await axios.get(url, { responseType: 'arraybuffer' });
//   const buffer = Buffer.from(response.data, 'binary');

//   return await new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         public_id,
//         resource_type,
//         overwrite: true,
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result);
//       }
//     );
//     streamifier.createReadStream(buffer).pipe(stream);
//   });
// };



export const uploadFromUrl = async (url, folder, public_id, resource_type = 'image') => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');

  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id,
        resource_type,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const updateCloudinary = async (req, res) => {
  try {
    const { name, description, folder, type, publicId } = req.body;
    const { id } = req.params;
    const file = req.body.file || null;
    console.log('req.body', req.body);
    

    const model = type === 'image' ? Photos : Video;
    const field = type === 'image' ? 'img' : 'video';

    const media = await model.findByPk(id);
    if (!media) {
      return res.status(404).json({ status: 'error', message: 'Archivo no encontrado' });
    }

    const updates = {
      name: name?.trim() || media.name,
      description,
      folder,
    };

    const result = {
      name: updates.name,
      status: 'success',
      action: '',
      cloudinary: null,
      database: null,
      message: '',
    };

    // ✅ 1. Subida nueva
    if (file) {
      const uploadResult = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: type,
        public_id: updates.name.replace(/\.[^/.]+$/, ''),
        overwrite: true,
      });

      updates[field] = uploadResult.secure_url;
      result.action = 'file_upload';
      result.cloudinary = uploadResult;

      // 🔥 Borrar archivo anterior
      // deletePhotoFromDatabase(publicId);
      deleteFile(publicId);
      const oldPublicId = media[field]
        .split('/')
        .slice(7)
        .join('/')
        .replace(/\.[^/.]+$/, '');

      try {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: type });
      } catch (err) {
        console.warn('No se pudo eliminar el anterior:', err.message);
      }

      // 🧹 Borrar carpeta vieja si queda vacía
      const oldFolderResources = await cloudinary.api.resources({
        type: 'upload',
        prefix: media.folder + '/',
        resource_type: type,
        max_results: 1,
      });

      if (oldFolderResources.resources.length === 0) {
        await cloudinary.api.delete_folder(media.folder);
      }

    // ✅ 2. Cambio de carpeta o nombre, sin nuevo archivo

    } else if (media.folder !== folder || media.name !== name) {
      console.log('no trae file, pero cambia de carpeta o nombre');
      
      const publicId = updates.name.replace(/\.[^/.]+$/, '');

      const uploaded = await uploadFromUrl(media[field], folder, publicId, type);
      updates[field] = uploaded.secure_url;
      result.action = 'reupload_from_url';
      result.cloudinary = uploaded;
      console.log('media.publicId', media.publicId);
      
      // 🔥 Borrar archivo anterior
      deleteFile(media.publicId);
      const oldPublicId = media[field]
        .split('/')
        .slice(7)
        .join('/')
        .replace(/\.[^/.]+$/, '');

      try {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: type });
      } catch (err) {
        console.warn('No se pudo eliminar el anterior:', err.message);
      }

      // 🧹 Eliminar carpeta vacía
      const oldFolderResources = await cloudinary.api.resources({
        type: 'upload',
        prefix: media.folder + '/',
        resource_type: type,
        max_results: 1,
      });

      if (oldFolderResources.resources.length === 0) {
        await cloudinary.api.delete_folder(media.folder);
      }

    // ✅ 3. Sólo cambia la descripción
    } else if (description !== media.description) {
      result.action = 'description_update';
    } else {
      result.status = 'warning';
      result.message = 'No hubo cambios significativos';
      return res.status(200).json(result);
    }

    // ✅ Actualizar en DB
    await media.update(updates);
    result.database = media;
    result.message = 'Archivo actualizado correctamente';

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error al actualizar:', error.message);
    return res.status(500).json({ status: 'error', message: 'Error al actualizar', error: error.message });
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

export const deleteFile = async (publicId) => {
  try {
     
    
    console.log('publicId', publicId);

    if (!publicId ) {
      return res.status(400).json({ error: 'Image ID are required' });
    }

      const response = await cloudinary.uploader.destroy(publicId);
      console.log('response delete==>', response);
      
   
    return ({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: `Failed to delete image with ID ${publicId}: ${error.message}` });
  }
};

// export const updateCloudinary = async (req, res) => {
//   try {
//     const { name, description, folder, type } = req.body;
//     const { id } = req.params;
//     const file = req.body.file || null;
//     const message1 = {message: ''};
//     console.log('FILE==>', file);
    

//     const model = type === 'image' ? Photos : Video;
//     const field = type === 'image' ? 'img' : 'video';

//     const media = await model.findByPk(id);
//     if (!media) return res.status(404).json({ message: 'Archivo no encontrado' });

//     const updates = { name, description, folder };
//     console.log('media', media);
//     console.log('updates', updates);
    

//     if (file) {
//       const uploadResult = await cloudinary.uploader.upload(file, {
//         folder,
//         resource_type: type,
//         public_id: name.split('.')[0],
//         overwrite: true,
//       });

//       updates[field] = uploadResult.secure_url;
//         console.log('uploadResult, trae file==>', uploadResult);

//     //   const oldPublicId = `${media.folder}/${media.name.split('.')[0]}`;
//     //   const clou=await cloudinary.uploader.destroy(oldPublicId, { resource_type: type });
//       message1.message = 'Archivo subido correctamente';

//     } else if (media.folder !== folder || media.name !== name) {
//                 console.log('no trae file, pero cambia de carpeta o nombre');
//                 console.log('media.folder==>', media.folder);
//                 console.log('folder=>', folder);
//         const finalName = name?.trim() ? name : media.name;
//         const publicId = finalName.replace(/\.[^/.]+$/, '');

//         const uploaded = await uploadFromUrl(media.img, folder, publicId, type);
//         updates[field] = uploaded.secure_url;
//         updates.name = finalName; // también actualizamos el name en base de datos si venía vacío

//         // 🔥 Borrar el original
//         const oldPublicId = media.img
//         .split('/')
//         .slice(7)
//         .join('/')
//         .replace(/\.[^/.]+$/, '');

//         try {
//         await cloudinary.uploader.destroy(oldPublicId, { resource_type: type });
//         } catch (err) {
//         console.warn('No se pudo eliminar el original:', err.message);
//         }

//         // 🧹 Eliminar carpeta vacía
//         const oldFolderResources = await cloudinary.api.resources({
//         type: 'upload',
//         prefix: media.folder + '/',
//         resource_type: type,
//         max_results: 1,
//         });

//         if (oldFolderResources.resources.length === 0) {
//         await cloudinary.api.delete_folder(media.folder);
//         }
//     //     const oldPublicId = `${media.folder}/${media.name}`;
//     //             console.log('oldPublicId', oldPublicId);
//     //     let newName = name;
//     //         if (!name || name === media.name) {
//     //         newName = media.name;
//     //         }
//     //     const newPublicId = `${folder}/${newName}`;
//     //             console.log('newPublicId', newPublicId);

//     //     // Renombrar archivo en Cloudinary
//     //     const renameResult = await cloudinary.uploader.rename(oldPublicId, newPublicId, {
//     //         resource_type: type,
//     //         overwrite: true,
//     //     });
//     //              console.log('renameResult===>', renameResult);
//     //     updates[field] = renameResult.secure_url;
        
//     //     const deleteFile = await cloudinary.uploader.destroy(oldPublicId, {
//     //         resource_type: type,
//     //     });

//     //               console.log('deleteFile', deleteFile);

//     //     // ✅ Verificar si la carpeta de origen quedó vacía
//     //     const oldFolderResources = await cloudinary.api.resources({
//     //         type: 'upload',
//     //         prefix: media.folder + '/',
//     //         resource_type: type,
//     //         max_results: 1, // solo necesitamos saber si hay al menos uno
//     //     });
//     //                 console.log('oldFolderResources', oldFolderResources);

//     //             if (oldFolderResources.resources.length === 0) {
//     //                 try {
//     //                 await cloudinary.api.delete_folder(media.folder);
//     //                 console.log(`Carpeta vacía eliminada: ${media.folder}`);
//     //                 } catch (folderError) {
//     //                 console.warn(`No se pudo eliminar la carpeta: ${media.folder}`, folderError.message);
//     //                 }
//     //             }
//     }
//     // ✅ si hay cambios (incluso solo description), se actualiza todo aquí
//     // await media.update(updates);

//     // return res.status(200).json({ message: 'Archivo actualizado correctamente', media });

//   } catch (error) {
//     console.error('Error al actualizar el archivo:', error.message);
//     return res.status(500).json({ message: 'Error al actualizar el archivo' });
//   }
// };


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