import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { commentService } from "./comments.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const comment = await commentService.createComment(req.body, user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Comment created successfully",
    data: comment,
  });
});

const getCommentByAuthorId = catchAsync(async (req: Request, res: Response) => {
  const comments = await commentService.getCommentByAuthorId(
    req.params.authorId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Comments retrieved successfully",
    data: comments,
  });
});

const getCommentByCommentId = catchAsync(async (req: Request, res: Response) => {
  const comment = await commentService.getCommentByCommentId(
    req.params.commentId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Comment retrieved successfully",
    data: comment,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const comment = await commentService.updateComment(
    req.params.commentId as string,
    req.body,
    user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Comment updated successfully",
    data: comment,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await commentService.deleteComment(
    req.params.commentId as string,
    user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Comment deleted successfully",
    data: result,
  });
});

const moderateComment = catchAsync(async (req: Request, res: Response) => {
  const comment = await commentService.moderateComment(
    req.params.commentId as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Comment moderated successfully",
    data: comment,
  });
});

export const commentController = {
  createComment,
  getCommentByAuthorId,
  getCommentByCommentId,
  updateComment,
  deleteComment,
  moderateComment,
};