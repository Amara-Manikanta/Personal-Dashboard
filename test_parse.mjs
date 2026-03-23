import fs from 'fs';
import { parse } from '@babel/parser';
const code = fs.readFileSync('src/components/WritingDashboard.jsx', 'utf8');
try {
  parse(code, { plugins: ['jsx'] });
  console.log("Syntax is OK!");
} catch (err) {
  console.error(err);
}
