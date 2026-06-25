import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import config from "../../config";
import { RegisterUserPayload } from "./users.interface";
import { Response } from "express";




const registerUser = async (payload: RegisterUserPayload) => {
  const { name, email, password, profilePhoto } = payload;

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
          profilePhoto
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

export const usersService = {
  registerUser,
  getMyProfile,
}
