import fs from "fs";
import path from "path";

const filePath = path.resolve(process.cwd(), "storage", "latestOrder.json");

export function saveLatestOrder(orderId: string, orderSellerItemId: string) {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        orderId,
        orderSellerItemId,
        savedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    "utf-8"
  );
}

export function getLatestOrder(): {
  orderId: string;
  orderSellerItemId: string;
  savedAt: string;
} {
  if (!fs.existsSync(filePath)) {
    throw new Error("No latestOrder.json file found.");
  }

  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}