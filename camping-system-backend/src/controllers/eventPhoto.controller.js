const eventPhotoService = require("../services/eventPhoto.service");

async function uploadEventPhoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Bir etkinlik fotoğrafı seçmelisiniz" });
    }

    const photo = await eventPhotoService.addEventPhotoFromUpload(
      req.user.id,
      req.params.eventId,
      req.file.filename,
      req.body.isCover === "true" || req.body.isCover === true
    );

    res.status(201).json({ success: true, message: "Etkinlik fotoğrafı yüklendi", data: photo });
  } catch (error) {
    next(error);
  }
}

async function getEventPhotos(req, res, next) {
  try {
    const photos = await eventPhotoService.getEventPhotos(req.params.eventId);
    res.status(200).json({ success: true, data: photos });
  } catch (error) {
    next(error);
  }
}

async function deleteEventPhoto(req, res, next) {
  try {
    await eventPhotoService.deleteEventPhoto(req.user.id, req.params.photoId);
    res.status(200).json({ success: true, message: "Etkinlik fotoğrafı silindi" });
  } catch (error) {
    next(error);
  }
}

module.exports = { uploadEventPhoto, getEventPhotos, deleteEventPhoto };
