import { prisma } from "../../lib/prisma";
import { ICreateCommentPayload, IUpdateCommentPayload, IModerateCommentPayload } from "./comments.interface";
import { Role } from "../../../generated/prisma/enums";

const createComment = async (payload: ICreateCommentPayload, authorId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: payload.postId },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const comment = await prisma.comment.create({
    data: {
      content: payload.content,
      postId: payload.postId,
      authorId,
      status: "APPROVED", // Default to APPROVED as per the rules
    },
  });

  return comment;
};

const getCommentsByAuthor = async (authorId: string) => {
  const comments = await prisma.comment.findMany({
    where: { authorId },
  });
  return comments;
};

const getCommentById = async (commentId: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true
        },
      },
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  return comment;
};

const updateComment = async (
  commentId: string,
  payload: IUpdateCommentPayload,
  user: any,
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (user.role !== Role.ADMIN && comment.authorId !== user.id) {
    throw new Error("You do not have permission to update this comment");
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: payload.content,
    },
  });

  return updatedComment;
};

const deleteComment = async (commentId: string, user: any) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (user.role !== Role.ADMIN && comment.authorId !== user.id) {
    throw new Error("You do not have permission to delete this comment");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { id: commentId };
};

const moderateComment = async (
  commentId: string,
  payload: IModerateCommentPayload,
  user: any,
) => {
  if (user.role !== Role.ADMIN) {
    throw new Error("Only admins can moderate comments");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: payload.status,
    },
  });

  return updatedComment;
};

export const commentsService = {
  createComment,
  getCommentsByAuthor,
  getCommentById,
  updateComment,
  deleteComment,
  moderateComment,
};