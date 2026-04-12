import { google } from "googleapis";
import { getGoogleAuth } from "./googleAuth";

type AutomationStatusRow = {
  feature: string;
  scenario: string;
  result: "Pass" | "Fail";
  checkedTime: string;
};

function normalize(value?: string) {
  return (value || "").trim().toLowerCase();
}

export async function upsertAutomationStatus(row: AutomationStatusRow) {
  const spreadsheetId = process.env.AUTOMATION_STATUS_SHEET_ID;
  const sheetName = process.env.AUTOMATION_STATUS_SHEET_NAME || "Sheet1";

  if (!spreadsheetId) {
    throw new Error("AUTOMATION_STATUS_SHEET_ID is missing in .env");
  }

  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const readResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:E`,
  });

  const rows = readResponse.data.values || [];

  let foundRow: number | null = null;
  let isAutomated = "";

  for (let i = 1; i < rows.length; i++) {
    const feature = normalize(rows[i][0]);
    const scenario = normalize(rows[i][1]);

    if (
      feature === normalize(row.feature) &&
      scenario === normalize(row.scenario)
    ) {
      foundRow = i + 1;
      isAutomated = normalize(rows[i][3]);
      break;
    }
  }

  if (foundRow) {
    if (isAutomated === "yes") {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!C${foundRow}:E${foundRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[row.result, "YES", row.checkedTime]],
        },
      });

      console.log(
        `✅ Updated row ${foundRow}: ${row.feature} / ${row.scenario} = ${row.result}`
      );
    } else {
      console.log(
        `⚠️ Skipped update because Is Automated is not YES: ${row.feature} / ${row.scenario}`
      );
    }

    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:E`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[row.feature, row.scenario, row.result, "YES", row.checkedTime]],
    },
  });

  console.log(`✅ Appended new row: ${row.feature} / ${row.scenario}`);
}