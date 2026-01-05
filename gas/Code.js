function doGet(e) {
    // Allow passing ?month=01 to select sheet "T01"
    // Default to current month if not provided
    const month = e.parameter.month || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM");
    const sheetName = "T" + month;

    const output = JSON.stringify(getAllData(sheetName));
    return ContentService.createTextOutput(output)
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        if (data.action === 'create') {
            const dateStr = data.payload.date; // YYYY-MM-DD
            // Extract Month from date string
            // dateStr is ISO "2024-01-01"
            const monthStr = dateStr.split('-')[1]; // "01"
            const sheetName = "T" + monthStr;

            addExpense(sheetName, data.payload);
            return ContentService.createTextOutput(JSON.stringify({ success: true, sheet: sheetName }))
                .setMimeType(ContentService.MimeType.JSON);
        }
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function getOrCreateSheet(sheetName) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        // Initialize Headers if new sheet
        const headers = [
            "Date", "Description", "Người trả", "Total Amount",
            "Vũ", "Duyên", "Phi", "Trổi",
            "Số người", "Tiền mỗi người"
        ];
        // Also Settlement table headers at L1 ? 
        // Usually settlement is global or per month? User said "Ngoài ra còn 1 bảng...".
        // Assuming Settlement is per month too for simplicity of "Closing the book".
        // If Settlement is global, it should be in a separate "Master" sheet.
        // However, based on the user's initial file, it was on the same sheet.
        // So we will init the headers for data only.
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

        // Create Settlement Headers at L1
        const settlementHeader = ["", "Phi", "Trổi", "Vũ", "Duyên"];
        sheet.getRange(1, 12, 1, 5).setValues([settlementHeader]);

        // Init Rows for Settlement (Senders)
        const senders = [["Vũ"], ["Duyên"], ["Phi"], ["Trổi"]]; // L2:L5
        sheet.getRange(2, 12, 4, 1).setValues(senders);
    }
    return sheet;
}

function getAllData(sheetName) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
        return { expenses: [], settlement: [], sheetName: sheetName, error: "Sheet not found" };
    }

    const lastRow = sheet.getLastRow();
    const expenseData = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 10).getValues() : [];

    // Filter out usage rows (all key columns must be present)
    const validExpenseData = expenseData.filter(row => row[0] && row[1] && row[2] && row[3]);

    const expenses = validExpenseData.map((row, index) => ({
        id: 'row-' + (index + 2),
        date: row[0],
        description: row[1],
        payer: row[2],
        amount: row[3],
        splitBy: {
            'Vũ': row[4] === true,
            'Duyên': row[5] === true,
            'Phi': row[6] === true,
            'Trổi': row[7] === true
        },
        count: row[8],
        splitAmount: row[9]
    }));

    // Read Settlement (L2:P5)
    // Check if we have enough rows
    let settlement = [];
    if (sheet.getMaxRows() >= 5) {
        // Headers are at M1..P1: Phi, Trổi, Vũ, Duyên
        const settlementRange = sheet.getRange("L2:P5").getValues();
        settlement = settlementRange.map((row) => {
            const sender = row[0];
            const map = {};
            // Row is [Sender, ValPhi, ValTroi, ValVu, ValDuyen]
            map['Phi'] = row[1];
            map['Trổi'] = row[2];
            map['Vũ'] = row[3];
            map['Duyên'] = row[4];

            return {
                sender: sender,
                receivers: map
            };
        });
    }

    return { expenses, settlement, sheetName };
}

function addExpense(sheetName, payload) {
    const sheet = getOrCreateSheet(sheetName);

    // Calculate Split
    let count = 0;
    if (payload.splitBy['Vũ']) count++;
    if (payload.splitBy['Duyên']) count++;
    if (payload.splitBy['Phi']) count++;
    if (payload.splitBy['Trổi']) count++;

    const splitAmount = count > 0 ? (payload.amount / count) : 0;

    const row = [
        new Date(payload.date),
        payload.description,
        payload.payer,
        payload.amount,
        payload.splitBy['Vũ'] || false,
        payload.splitBy['Duyên'] || false,
        payload.splitBy['Phi'] || false,
        payload.splitBy['Trổi'] || false,
        count,
        splitAmount
    ];

    sheet.appendRow(row);
}
