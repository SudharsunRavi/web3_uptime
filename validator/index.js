import WebSocket from "ws";
import dotenv from "dotenv";
import { Keypair, PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const CALLBACKS = {};
let validatorId = null;

async function main() {
  const keypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE))
  );

  const ws = new WebSocket("ws://localhost:8080");

  ws.on("open", async () => {
    const callbackId = uuidv4();

    CALLBACKS[callbackId] = (data) => {
      validatorId = data.validatorId;
      console.log(`Registered validator ID: ${validatorId}`);
    };

    const signedMessage = await signMessage(
      `Signed message for ${callbackId}, ${keypair.publicKey.toString()}`,
      keypair
    );

    ws.send(
      JSON.stringify({
        type: "signup",
        data: {
          callbackId,
          ip: "127.0.0.1",
          publicKey: keypair.publicKey.toString(),
          signedMessage,
        },
      })
    );
  });

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg.toString());

    if (data.type === "signup") {
      CALLBACKS[data.data.callbackId]?.(data.data);
      delete CALLBACKS[data.data.callbackId];
    } else if (data.type === "validate") {
      await validateHandler(ws, data.data, keypair);
    }
  });

  ws.on("close", () => {
    console.log("Connection closed");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
}

async function validateHandler(ws, { url, callbackId, websiteId }, keypair) {
  console.log(`Validating ${url}`);
  const startTime = Date.now();
  const signature = await signMessage(`Replying to ${callbackId}`, keypair);

  try {
    const response = await fetch(url);
    const endTime = Date.now();
    const latency = endTime - startTime;
    const status = response.status;

    ws.send(
      JSON.stringify({
        type: "validate",
        data: {
          callbackId,
          status: status === 200 ? "Good" : "Bad",
          latency,
          websiteId,
          validatorId,
          signedMessage: signature,
        },
      })
    );
  } catch (error) {
    console.error("Error validating:", error);

    ws.send(
      JSON.stringify({
        type: "validate",
        data: {
          callbackId,
          status: "Bad",
          latency: 1000,
          websiteId,
          validatorId,
          signedMessage: signature,
        },
      })
    );
  }
}

async function signMessage(message, keypair) {
  const messageBytes = naclUtil.decodeUTF8(message);
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
  return JSON.stringify(Array.from(signature));
}

main();
