import { Photos } from "../models/photos.js";


export const savePhotoToDatabase = async ({ name, description, img, type, folder, publicId }) => {
  const photoCreated = await Photos.create({ name, description, img, type, folder, publicId });
  return photoCreated;
};

export const deletePhotoFromDatabase = async (publicId) => {
  const deleted = await Photos.destroy({
    where: {
      name: `${publicId}.jpg` // o ajustalo según cómo guardás el nombre
    },
  });
  return deleted;
};

export const createPhoto = async (req, res) => {
  try {
    const photoCreated = await Photos.create({ ...req.body });
    if (!photoCreated)
      return res.status(401).send({ message: "The Photo has not been created." });
    res.status(200).send({
      message: "You created this photo.",
      photoCreated,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
    console.log(error.message, "error");
  }
}

export const updatePhoto = async (req, res) => {
  const { id } = req.params;
  try {
    const photoUpdated = await Photos.update(req.body, {
      where: {
        id,
      },
    });
    if (!photoUpdated)
      return res.status(404).send({ message: "Photo not found." });
    res.status(200).send({
      message: "Photo updated successfully.",
      photoUpdated,
    });
  }
  catch (error) {
    res.status(409).json({ message: error.message });
  }
}

export const getPhotos = async (req, res) => {
  try {
    const photos = await Photos.findAll();
    if (!photos)
      return res.status(404).send({ message: "No photos found." });
    res.status(200).send({
      message: "Photos retrieved successfully.",
      photos,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}   

export const getPhotoId = async (req, res) => {
  const { id } = req.params;
  try {
    const photo = await Photos.findByPk(id);
    if (!photo)
      return res.status(404).send({ message: "Photo not found." });
    res.status(200).send({
      message: "Photo retrieved successfully.",
      photo,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deletePhoto = async (req, res) => {
  const { id } = req.params;
  try {
    const photoDeleted = await Photos.destroy({
      where: {
        id,
      },
    });
    if (!photoDeleted)
      return res.status(404).send({ message: "Photo not found." });
    res.status(200).send({
      message: "Photo deleted successfully.",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}



