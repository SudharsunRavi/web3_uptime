import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import { v4 as uuidv4 } from "uuid";

import connectDb from "../server/database.js";
import Website from "../server/models/website.model.js";
import Validator from "../server/models/validator.model.js";
import WebsiteTick from "../server/models/websiteTick.model.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const availableValidators = [];
const CALLBACKS = {};
const COST_PER_VALIDATION = 100;

wss.on("connection", (ws) => {
  console.log("New connection established");
  ws.on("message", async (msg) => {
    const data = JSON.parse(msg.toString());
    console.log("Received message:", data);

    if (data.type === "signup") {
      const verified = await verifyMessage(
        `Signed message for ${data.data.callbackId}, ${data.data.publicKey}`,
        data.data.publicKey,
        data.data.signedMessage
      );

      if (verified) {
        await signupHandler(ws, data.data);
      }

    } else if (data.type === "validate") {
      CALLBACKS[data.data.callbackId]?.(data);
      delete CALLBACKS[data.data.callbackId];
    }
  });

  ws.on("close", () => {
    const idx = availableValidators.findIndex(v => v.socket === ws);
    if (idx !== -1) {
      availableValidators.splice(idx, 1);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

async function signupHandler(ws, { ip, publicKey, signedMessage, callbackId }) {
  let validator = await Validator.findOne({ publicKey });
  console.log("Validator found:", validator);
  if (!validator) {
    validator = await Validator.create({
      ip,
      publicKey,
      location: "unknown"
    });
  }

  availableValidators.push({
    validatorId: validator._id.toString(),
    socket: ws,
    publicKey: validator.publicKey
  });

  ws.send(JSON.stringify({
    type: "signup",
    data: {
      validatorId: validator._id,
      callbackId
    }
  }));
}

async function verifyMessage(message, publicKey, signature) {
  const messageBytes = naclUtil.decodeUTF8(message);
  const result = nacl.sign.detached.verify(
    messageBytes,
    new Uint8Array(JSON.parse(signature)),
    new PublicKey(publicKey).toBytes()
  );
  console.log("Verification result:", result);
  return result;
}

// Periodic monitoring (every 60s)
setInterval(async () => {
  const websitesToMonitor = await Website.find({ disabled: false });

  for (const website of websitesToMonitor) {
    availableValidators.forEach((validator) => {
      const callbackId = uuidv4();

      validator.socket.send(JSON.stringify({
        type: "validate",
        data: {
          url: website.url,
          callbackId
        }
      }));

      CALLBACKS[callbackId] = async (data) => {
        const { validatorId, status, latency, signedMessage } = data.data;
        const verified = await verifyMessage(
          `Replying to ${callbackId}`,
          validator.publicKey,
          signedMessage
        );

        if (!verified) return;

        await WebsiteTick.create({
          websiteId: website._id,
          validatorId,
          status,
          latency,
          createdAt: new Date()
        });
      };
    });
  }
}, 60 * 1000);

connectDb().then(() => {
  server.listen(8080, () => {
    console.log(`Hub running`);
  });
}).catch((err) => {
  console.error("MongoDB connection failed:", err);
});
