import * as XLSX from 'xlsx';
import * as fs from 'fs';

const buf = fs.readFileSync('C:\\Users\\mf t\\Downloads\\PP LEDGER_FINAL-USMAN (3).xlsx');
const wb = XLSX.read(buf, { type: 'buffer', cellDates: true });
console.log('Total sheets:', wb.SheetNames.length);
console.log('');

const names = wb.SheetNames;
console.log('First 30 sheets:');
names.slice(0, 30).forEach((n, i) => {
  const ws = wb.Sheets[n];
  const ref = ws && ws['!ref'] ? ws['!ref'] : 'empty';
  const range = ref !== 'empty' ? XLSX.utils.decode_range(ref) : null;
  console.log(`  ${i}: ${n} (${ref}, ${range ? (range.e.r + 1) + ' rows x ' + (range.e.c + 1) + ' cols' : 'empty'})`);
});

console.log('...');
names.slice(-5).forEach((n, i) => {
  const idx = names.length - 5 + i;
  const ws = wb.Sheets[n];
  const ref = ws && ws['!ref'] ? ws['!ref'] : 'empty';
  console.log(`  ${idx}: ${n} (${ref})`);
});

// Find summary sheets
console.log('\nSummary sheets:');
names.filter(n => n.toLowerCase().includes('summary') || n.toLowerCase() === 'overview' || n.toLowerCase() === 'sheet1' || n.toLowerCase() === 'sheet2').forEach(n => {
  const ws = wb.Sheets[n];
  const ref = ws && ws['!ref'] ? ws['!ref'] : 'empty';
  console.log(`  ${n} (${ref})`);
});

// Show the header row of the first sheet
console.log('\nFirst sheet header (row 6):');
const firstSheet = wb.Sheets[names[0]];
if (firstSheet) {
  const json = XLSX.utils.sheet_to_json(firstSheet, { header: 1, range: 5, blankrows: false });
  console.log('  Row 6:', JSON.stringify(json[0]?.slice(0, 15)));
  console.log('  Row 7:', JSON.stringify(json[1]?.slice(0, 15)));
  console.log('  Row 8:', JSON.stringify(json[2]?.slice(0, 15)));
}

// Show the header of a ledger sheet (e.g., one that looks like a party code)
const ledgerSheet = names.find(n => /^[A-Z]{1,2}\d+/.test(n) || /^[A-Z]\d+/.test(n));
if (ledgerSheet) {
  console.log(`\nLedger sheet "${ledgerSheet}" header:`);
  const ws = wb.Sheets[ledgerSheet];
  const json = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
  for (let i = 0; i < Math.min(5, json.length); i++) {
    console.log(`  Row ${i+1}:`, JSON.stringify(json[i]?.slice(0, 15)));
  }
}

// Save analysis to a file
const analysis = {
  totalSheets: names.length,
  sheetNames: names,
  summarySheets: names.filter(n => n.toLowerCase().includes('summary') || n.toLowerCase() === 'overview' || n === 'Sheet1' || n === 'Sheet2'),
};
fs.writeFileSync('excel-analysis.json', JSON.stringify(analysis, null, 2));
console.log('\nAnalysis saved to excel-analysis.json');
