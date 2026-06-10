import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { getLatestOrder } from "../../utils/orderStorage";
import { sellerLogin, acceptOrder } from "../../utils/sellerApi";
import { upsertAutomationStatus } from "../../utils/automationStatusSheet";
import { now } from "../../utils/timeHelper";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

test.describe("Seller Flow: Accept Order via API", () => {
  test("Seller accepts the latest placed order", async () => {
    const { orderId, orderSellerItemId } = getLatestOrder();

    console.log(`📦 Order Number     : ${orderId}`);
    console.log(`🔑 orderSellerItemId: ${orderSellerItemId}`);

    expect(orderSellerItemId, "orderSellerItemId must exist").toBeTruthy();

    const token = await sellerLogin();
    expect(token, "Seller token must be returned").toBeTruthy();

    await acceptOrder(token, orderSellerItemId);

    console.log(`✅ Order ${orderId} accepted successfully by seller`);

    await upsertAutomationStatus({
      feature: "Order Acceptance",
      scenario: "Seller accepts order",
      result: "Pass",
      checkedTime: now(),
    });

    console.log(`📊 Sheet updated — Order Acceptance: Pass`);
  });
});