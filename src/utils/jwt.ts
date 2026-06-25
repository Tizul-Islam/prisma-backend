import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  { expiresIn }: SignOptions,
) => {
  const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
  return token;
};


const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return verifiedToken as JwtPayload;
  } catch (error: any) {
    console.error("token verification failed", error);
    return error?.message ?? "Token verification failed";
  }
};

  

export const jwtUtils = {
  createToken,
  verifyToken,
};
