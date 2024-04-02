const { parentPort, workerData } = require('worker_threads');
const xlsx = require('xlsx');
const fs = require('fs');

// Function to read Excel file
function readExcelFile(filePath) {
    try {
        // Read Excel file
        const workbook = xlsx.readFile(filePath);
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Parse sheet data
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        return data;
    } catch (error) {
        throw new Error(`Error reading Excel file: ${error.message}`);
    }
}

// Read Excel file provided by the main thread
const filePath = workerData;
const excelData = readExcelFile(filePath);

// Send extracted data back to the main thread
parentPort.postMessage(excelData);


