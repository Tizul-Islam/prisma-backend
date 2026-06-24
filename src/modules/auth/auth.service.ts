import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface";
import bcrypt from "bcrypt";




const loginUser = async (payload: ILoginUser) =>  {

const { email, password } = payload;
// const user = await prisma.user.findUnique({
//   where: { email },
//   include: {
//     profile: true,
//   },


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

return user;
}

export const authService = {
  loginUser,
};