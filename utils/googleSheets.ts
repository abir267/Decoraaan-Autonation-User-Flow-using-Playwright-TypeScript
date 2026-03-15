import dotenv from "dotenv";
import path from "path";
import { google } from "googleapis";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

type SignupRow = {
  name: string;
  email: string;
  password: string;
  createdTime: string;
};

function getGoogleAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in .env"
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function saveUserToGoogleSheet(row: SignupRow) {
  const spreadsheetId = process.env.SIGNUP_SHEET_ID;
  const sheetName = process.env.SIGNUP_SHEET_NAME || "Sheet1";

  if (!spreadsheetId) {
    throw new Error("SIGNUP_SHEET_ID is missing in .env");
  }

  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:D`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[row.name, row.email, row.password, row.createdTime]],
    },
  });

  console.log(`✅ Signup user saved to Google Sheet: ${row.email}`);
}