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
  getCampPhotos,
  deleteCampPhoto
};