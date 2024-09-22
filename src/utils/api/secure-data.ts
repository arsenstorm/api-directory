"use server";

import NextCrypto from "next-crypto";

const key = new NextCrypto(process.env.ENCRYPTION_KEY ?? "");

export async function encryptData(data: string): Promise<string> {
  if (!process.env.ENCRYPTION_KEY) {
    return data;
  }

  return Buffer.from(await key.encrypt(data)).toString("base64");
}

export async function decryptData(data: string): Promise<string | null> {
  if (!process.env.ENCRYPTION_KEY) {
    return data;
  }

  return await key.decrypt(Buffer.from(data, "base64").toString("utf-8"));
}
