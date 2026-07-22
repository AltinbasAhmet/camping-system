const service = require("../services/campComment.service");

async function getCampComments(req, res, next) {
  try { res.status(200).json({ success: true, data: await service.getCampComments(req.params.campId) }); }
  catch (error) { next(error); }
}
async function createCampComment(req, res, next) {
  try { res.status(201).json({ success: true, message: "Comment added", data: await service.createCampComment(req.params.campId, req.user.id, req.body) }); }
  catch (error) { next(error); }
}
async function deleteCampComment(req, res, next) {
  try { res.status(200).json({ success: true, message: "Comment deleted", data: await service.deleteCampComment(req.params.commentId, req.user) }); }
  catch (error) { next(error); }
}
module.exports = { getCampComments, createCampComment, deleteCampComment };
