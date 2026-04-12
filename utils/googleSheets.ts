import { google } from "googleapis";
import { getGoogleAuth } from "./googleAuth";

type SignupRow = {
  name: string;
  email: string;
  password: string;
  createdTime: string;
};

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