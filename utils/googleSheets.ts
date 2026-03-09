import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

type SignupUserRow = {
  name: string;
  email: string;
  password: string;
  createdTime: string;
};

export async function saveUserToGoogleSheet(user: SignupUserRow) {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error("Missing Google Sheets environment variables.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[user.name, user.email, user.password, user.createdTime]],
    },
  });
}