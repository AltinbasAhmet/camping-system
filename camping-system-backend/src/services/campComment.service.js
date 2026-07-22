const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

async function ensureActiveCamp(campId) {
  const id = Number(campId);
  if (!id) throw new AppError("Invalid camp ID", 400);
  const camp = await prisma.camp.findUnique({ where: { id }, select: { id: true, status: true, ownerId: true } });
  if (!camp || camp.status !== "ACTIVE") throw new AppError("Camp not found", 404);
  return camp;
}

async function getCampComments(campId) {
  const camp = await ensureActiveCamp(campId);
  const comments = await prisma.campComment.findMany({
    where: { campId: camp.id },
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" }
  });
  const ratings = comments.filter((item) => item.rating).map((item) => item.rating);
  return {
    comments,
    total: comments.length,
    averageRating: ratings.length ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : null
  };
}

async function createCampComment(campId, userId, data) {
  const camp = await ensureActiveCamp(campId);
  return prisma.campComment.create({
    data: { campId: camp.id, userId, content: data.content.trim(), rating: data.rating || null },
    include: { user: { select: { id: true, name: true, role: true } } }
  });
}

async function deleteCampComment(commentId, requester) {
  const id = Number(commentId);
  if (!id) throw new AppError("Invalid comment ID", 400);
  const comment = await prisma.campComment.findUnique({
    where: { id },
    include: { camp: { select: { ownerId: true } } }
  });
  if (!comment) throw new AppError("Comment not found", 404);
  const canDelete = comment.userId === requester.id || comment.camp.ownerId === requester.id || requester.role === "SYSTEM_ADMIN";
  if (!canDelete) throw new AppError("You are not allowed to delete this comment", 403);
  await prisma.campComment.delete({ where: { id } });
  return comment;
}

module.exports = { getCampComments, createCampComment, deleteCampComment };
