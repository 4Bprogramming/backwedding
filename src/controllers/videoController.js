import { Video } from "../models/Videos.js";


export const saveVideoToDatabase = async ({ name, description, video, type, folder, publicId }) => {
  const videoCreated = await Video.create({ name, description, video, type, folder, publicId });
  return videoCreated;
};

// import { Video } from '../models'; // o tu modelo real

export const deleteVideoFromDatabase = async (publicId) => {
  const deleted = await Video.destroy({
    where: {
      name: `${publicId}.mp4` // o según tu lógica de nombre
    },
  });
  return deleted;
};



export const createVideo = async (req, res) => {
  try {
    const videoCreated = await Video.create({ ...req.body });
    if (!videoCreated)
      return res.status(401).send({ message: "The Video has not been created." });
    res.status(200).send({
      message: "You created this video.",
      videoCreated,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
    console.log(error.message, "error");
  }
}

export const updateVideo = async (req, res) => {
  const { id } = req.params;
  try {
    const videoUpdated = await Video.update(req.body, {
      where: {
        id,
      },
    });
    if (!videoUpdated)
      return res.status(404).send({ message: "Video not found." });
    res.status(200).send({
      message: "Video updated successfully.",
      videoUpdated,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}

export const getVideos = async (req, res) => {
  try {
    const videos = await Video.findAll();
    if (!videos)
      return res.status(404).send({ message: "No videos found." });
    res.status(200).send({
      message: "Videos retrieved successfully.",
      videos,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}

export const getVideoId = async (req, res) => {
  const { id } = req.params;
  try {
    const video = await Video.findByPk(id);
    if (!video)
      return res.status(404).send({ message: "Video not found." });
    res.status(200).send({
      message: "Video retrieved successfully.",
      video,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  try {
    const videoDeleted = await Video.destroy({
      where: {
        id,
      },
    });
    if (!videoDeleted)
      return res.status(404).send({ message: "Video not found." });
    res.status(200).send({
      message: "Video deleted successfully.",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}