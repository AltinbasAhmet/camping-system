const campPhotoService = require("../services/campPhoto.service");

async function addCampPhoto(req, res, next) {
  try {
    const photo = await campPhotoService.addCampPhoto(
      req.user.id,
      req.params.campId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Camp photo added successfully",
      data: photo
    });
  } catch (error) {
    next(error);
  }
}

async function uploadCampPhoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Bir fotoğraf dosyası (JPEG veya PNG) yüklemelisiniz"
      });
    }

    const isCover = req.body.isCover === "true" || req.body.isCover === true;

    const photo = await campPhotoService.addCampPhotoFromUpload(
      req.user.id,
      req.params.campId,
      req.file.filename,
      isCover
    );

    res.status(201).json({
      success: true,
      message: "Camp photo uploaded successfully",
      data: photo
    });
  } catch (error) {
    next(error);
  }
}

async function getCampPhotos(req, res, next) {
  try {
    const photos = await campPhotoService.getCampPhotos(req.params.campId);

    res.status(200).json({
      success: true,
      data: photos
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCampPhoto(req, res, next) {
  try {
    await campPhotoService.deleteCampPhoto(
      req.user.id,
      req.params.photoId
    );

    res.status(200).json({
      success: true,
      message: "Camp photo deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addCampPhoto,
  uploadCampPhoto,
  getCampPhotos,
  deleteCampPhoto
};