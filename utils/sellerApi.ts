import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

const API_BASE_URL = process.env.API_BASE_URL || "http://api.ssldev.com:8000";

export async function sellerLogin(): Promise<string> {
  const email = process.env.SELLER_EMAIL!;
  const password = process.env.SELLER_PASSWORD!;

  console.log(`🔐 Seller login attempt: ${email}`);

  const authResponse = await fetch(
    `${API_BASE_URL}/services/ums/api/authenticate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": "http://auth.ssldev.com",
        "Referer": "http://auth.ssldev.com/",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        username: email,
        password: password,
        rememberMe: false,
      }),
    }
  );

  if (!authResponse.ok) {
    const errorBody = await authResponse.text();
    throw new Error(
      `Seller login failed: ${authResponse.status} ${authResponse.statusText} — ${errorBody}`
    );
  }

  const authData = await authResponse.json();
  console.log(`📋 Full auth response: ${JSON.stringify(authData, null, 2)}`);
  const rawToken = authData.data?.content?.accessToken;

  if (!rawToken) {
    throw new Error(`No token in auth response: ${JSON.stringify(authData)}`);
  }

  console.log("✅ Seller logged in successfully");
  return rawToken;
}

export async function acceptOrder(
  token: string,
  orderSellerItemId: string
): Promise<void> {
  console.log(`🔑 Accepting order with ID: ${orderSellerItemId}`);

  const response = await fetch(
    `${API_BASE_URL}/services/order/api/orders/order-status-update`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Authorization": `Bearer ${token}`,
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Time-Zone": "Asia/Dhaka",
        "Origin": "http://order.ssldev.com",
        "Referer": "http://order.ssldev.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        orderSellerItemId: [orderSellerItemId],
        targetOrderProcessStatus: "ORDER_ACCEPTED",
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Accept order failed: ${response.status} ${response.statusText} — ${errorBody}`
    );
  }

  const data = await response.json();
  console.log(`✅ Order accepted successfully:`, JSON.stringify(data, null, 2));
}