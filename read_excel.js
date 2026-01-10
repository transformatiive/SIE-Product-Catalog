const XLSX = require('xlsx');
const workbook = XLSX.readFile('attached_assets/Logica_Geracao_Referencias_Codigos_1768077098668.xlsx');
const sheets = workbook.SheetNames;
console.log('=== SHEETS ===');
console.log(sheets);
sheets.forEach(sheetName => {
  console.log(`\n=== SHEET: ${sheetName} ===`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  data.forEach((row, i) => {
    if (row.some(cell => cell !== '')) {
      console.log(`Row ${i}: ${JSON.stringify(row)}`);
    }
  });
});
