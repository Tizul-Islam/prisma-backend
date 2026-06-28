import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { postService } from "./post.service";

const createPost = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const post = await postService.createPost(req.body, user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Post created successfully",
    data: post,
  });
});  

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await postService.getAllPosts(req.query as any);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Posts retrieved successfully",
    data: result.data,
    pagination: result.pagination,
  } as any);
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const post = await postService.getPostById(req.params.postId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Post retrieved successfully",
    data: post,
  });
});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await postService.getMyPosts(user.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My Posts retrieved successfuly",
        data: result
    })
});

const updatePost = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const isAdmin = req.user?.role === "ADMIN";
    const postId = req.params.postId;

    if (!postId) {
        throw new Error("Post Id Required In Params")
    }

    const payload = req.body;

    const result = await postService.updatePost(postId as string, payload, isAdmin)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post updated successfully",
        data: result
    })
})

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await postService.deletePost(req.params.postId as string, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Post deleted successfully",
    data: result,
  });
});

const getPostsStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await postService.getPostsStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Post statistics retrieved successfully",
    data: stats,
  });
});

export const postController = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getPostsStats,
};
