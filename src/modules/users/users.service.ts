import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import config from "../../config";
import { RegisterUserPayload } from "./users.interface";
import { Response } from "express";




const registerUser = async (payload: RegisterUserPayload) => {
  const { name, email, password, profilePhoto, bio } = payload;

  const isUserExit = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExit) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      profile:{
        create:{
          profilePicture: profilePhoto,
          bio
        }
      }
    },
  });



  const user = await prisma.user.findUnique({
    where: { id: createdUser.id, email: createdUser.email || email },
    omit: { password: true },
    include: {
      profile: true,
    },
  });
  return user;
};


const getMyProfile = async (userId : string) => {

  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { 
      password: true,
    },
    include: {
      profile: true,
    },
  });
  return user

}


const updateMyProfile = async (userId : string , payload : RegisterUserPayload) => {
  const { name, email, password, profilePhoto,bio } = payload;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      password,
      profile: {
        upsert: {
          create: {
            profilePicture: profilePhoto,
            bio
          },
          update: {
            profilePicture: profilePhoto,
            bio
          }
        },
      },
    },

    omit: {
      password :true
    },
    
    include:{
      profile:true
    }
  });
  return updatedUser;
}

export const usersService = {
  registerUser,
  getMyProfile,
  updateMyProfile,
}
