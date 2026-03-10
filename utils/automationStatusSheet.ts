import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

type AutomationStatusRow = {
  scenario: string;
  result: string;
  comments: string;
  checkedTime: string;
};

function getGoogleAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google service account credentials.");
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function upsertAutomationStatus(row: AutomationStatusRow) {
  const spreadsheetId = process.env.AUTOMATION_STATUS_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error("AUTOMATION_STATUS_SHEET_ID is missing in .env");
  }

  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const readResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!A:D",
  });

  const rows = readResponse.data.values || [];

  let foundRowNumber: number | null = null;

  for (let i = 1; i < rows.length; i++) {
    const existingScenario = rows[i][0]?.trim();

    if (existingScenario === row.scenario) {
      foundRowNumber = i + 1;
      break;
    }
  }

  if (foundRowNumber) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!B${foundRowNumber}:D${foundRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[row.result, row.comments, row.checkedTime]],
      },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[row.scenario, row.result, row.comments, row.checkedTime]],
      },
    });
  }
}