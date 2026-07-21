const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

async function findOwnedEvent(userId, eventId) {
  const event = await prisma.campEvent.findUnique({
    where: { id: Number(eventId) }
  });

  if (!event) throw new AppError("Etkinlik bulunamadı", 404);
  if (event.organizerId !== userId) {
    throw new AppError("Yalnızca kendi etkinliğinize fotoğraf ekleyebilirsiniz", 403);
  }
  return event;
}

async function addEventPhotoFromUpload(userId, eventId, filename, isCover) {
  const event = await findOwnedEvent(userId, eventId);

  const existingCount = await prisma.eventPhoto.count({ where: { eventId: event.id } });
  const shouldBeCover = Boolean(isCover) || existingCount === 0;

  if (shouldBeCover) {
    await prisma.eventPhoto.updateMany({
      where: { eventId: event.id },
      data: { isCover: false }
    });
  }

  return prisma.eventPhoto.create({
    data: {
      eventId: event.id,
      imageUrl: `/uploads/event-photos/${filename}`,
      isCover: shouldBeCover
    }
  });
}

async function getEventPhotos(eventId) {
  const event = await prisma.campEvent.findUnique({ where: { id: Number(eventId) } });
  if (!event) throw new AppError("Etkinlik bulunamadı", 404);

  return prisma.eventPhoto.findMany({
    where: { eventId: Number(eventId) },
    orderBy: [{ isCover: "desc" }, { createdAt: "asc" }]
  });
}

async function deleteEventPhoto(userId, photoId) {
  const photo = await prisma.eventPhoto.findUnique({
    where: { id: Number(photoId) },
    include: { event: true }
  });

  if (!photo) throw new AppError("Fotoğraf bulunamadı", 404);
  if (photo.event.organizerId !== userId) {
    throw new AppError("Yalnızca kendi etkinliğinizin fotoğrafını silebilirsiniz", 403);
  }

  await prisma.eventPhoto.delete({ where: { id: photo.id } });

  if (photo.imageUrl.startsWith("/uploads/")) {
    const relativePath = photo.imageUrl.replace(/^\/+/, "");
    const filePath = path.join(__dirname, "..", "..", relativePath);
    fs.unlink(filePath, () => {});
  }

  if (photo.isCover) {
    const nextPhoto = await prisma.eventPhoto.findFirst({
      where: { eventId: photo.eventId },
      orderBy: { createdAt: "asc" }
    });
    if (nextPhoto) {
      await prisma.eventPhoto.update({
        where: { id: nextPhoto.id },
        data: { isCover: true }
      });
    }
  }

  return true;
}

module.exports = { addEventPhotoFromUpload, getEventPhotos, deleteEventPhoto };
