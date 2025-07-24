import { Photos } from "../models/photos.js";
import { Video } from '../models/Videos.js';

export const getAllMediaHandler = async (req, res) => {
  try {
    const photos = await Photos.findAll({ where: { deleted: false } });
    const videos = await Video.findAll({ where: { deleted: false } });

    const formattedPhotos = photos.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      file: p.img,
      type: 'image',
      folder: p.folder,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    const formattedVideos = videos.map((v) => ({
      id: v.id,
      name: v.name,
      description: v.description,
      file: v.video,
      type: 'video',
      folder: v.folder,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));

    const combined = [...formattedPhotos, ...formattedVideos];

    // Ordenar por fecha de creación descendente
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(combined);
  } catch (error) {
    console.error("Error al obtener media:", error.message);
    res.status(500).json({ message: "Error al obtener archivos" });
  }
};
