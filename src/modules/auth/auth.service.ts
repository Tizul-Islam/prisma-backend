import { access } from "fs";
import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error("Invalid credentials");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expiry } as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    { expiresIn: config.jwt_refresh_expiry } as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};


const refreshToken = async (refreshToken : string) =>{
   const verifyRefreshToken = jwtUtils.verifyToken(refreshToken,config.jwt_refresh_secret)

   if(!verifyRefreshToken.success){
    throw new Error("Invalid refresh token")
   }

   const {id} = verifyRefreshToken.data as JwtPayload;


   const user = await prisma.user.findUnique({
    where: { id },
   })

   if(!user){
    throw new Error("User not found")
   }

   const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expiry } as SignOptions,
  );

  const newRefreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    { expiresIn: config.jwt_refresh_expiry } as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };



}

export const authService = {
  loginUser,
  refreshToken
};


