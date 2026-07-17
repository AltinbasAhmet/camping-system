const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

async function addCampPhoto(ownerId, campId, data) {
  const camp = await prisma.camp.findUnique({
    where: {
      id: Number(campId)
    }
  });

  if (!camp) {
    throw new AppError("Camp not found", 404);
  }

  if (camp.ownerId !== ownerId) {
    throw new AppError("You can only add photos to your own camp", 403);
  }

  if (data.isCover) {
    await prisma.campPhoto.updateMany({
      where: {
        campId: camp.id
      },
      data: {
        isCover: false
      }
    });
  }

  const photo = await prisma.campPhoto.create({
    data: {
      campId: camp.id,
      imageUrl: data.imageUrl,
      isCover: data.isCover || false
    }
  });

  return photo;
}

// Dosya yükleme ile eklenen fotoğraf: imageUrl, multer'ın diske kaydettiği
// dosyanın herkese açık /uploads yoluna göre oluşturulur.
async function addCampPhotoFromUpload(ownerId, campId, filename, isCover) {
  const imageUrl = `/uploads/camp-photos/${filename}`;
  return addCampPhoto(ownerId, campId, { imageUrl, isCover });
}

async function getCampPhotos(campId) {
  const camp = await prisma.camp.findUnique({
    where: {
      id: Number(campId)
    }
  });

  if (!camp) {
    throw new AppError("Camp not found", 404);
  }

  return prisma.campPhoto.findMany({
    where: {
      campId: Number(campId)
    },
    orderBy: [
      {
        isCover: "desc"
      },
      {
        createdAt: "desc"
      }
    ]
  });
}

async function deleteCampPhoto(ownerId, photoId) {
  const photo = await prisma.campPhoto.findUnique({
    where: {
      id: Number(photoId)
    },
    include: {
      camp: true
    }
  });

  if (!photo) {
    throw new AppError("Photo not found", 404);
  }

  if (photo.camp.ownerId !== ownerId) {
    throw new AppError("You can only delete photos from your own camp", 403);
  }

  await prisma.campPhoto.delete({
    where: {
      id: Number(photoId)
    }
  });

  if (photo.imageUrl.startsWith("/uploads/")) {
    const filePath = path.join(__dirname, "..", "..", photo.imageUrl);
    fs.unlink(filePath, () => {});
  }

  return true;
}

module.exports = {
  addCampPhoto,
  addCampPhotoFromUpload,
  getCampPhotos,
  deleteCampPhoto
};