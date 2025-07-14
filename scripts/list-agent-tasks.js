#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const EXTS = ['.js', '.jsx', '.ts', '.tsx'];
const ROOT = path.resolve(__dirname, '..', 'src');

function scanDir(dir, results = []) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath, results);
        } else if (EXTS.includes(path.extname(file))) {
            const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
            lines.forEach((line, idx) => {
                if (line.includes('AGENT_TASK:')) {
                    results.push({
                        file: path.relative(process.cwd(), fullPath),
                        line: idx + 1,
                        text: line.trim()
                    });
                }
            });
        }
    });
    return results;
}

const tasks = scanDir(ROOT);
if (tasks.length === 0) {
    console.log('No AGENT_TASKs found.');
} else {
    console.log('AGENT_TASKs found:');
    tasks.forEach(task => {
        console.log(`- ${task.file}:${task.line}  ${task.text}`);
    });
} 