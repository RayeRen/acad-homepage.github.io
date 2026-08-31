#!/bin/bash
# Compile CV and output to assets/CV.pdf
# Run from Linwei-CV/ directory: bash compile.sh

set -e
cd "$(dirname "$0")"

xelatex -interaction=nonstopmode main.tex

DATE=$(date +"%Y.%m.%d")
OUTPUT="../assets/CV - Linwei Tao - ${DATE}.pdf"
cp main.pdf "${OUTPUT}"

# Clean up auxiliary files
rm -f main.aux main.log main.out main.fls main.fdb_latexmk

echo "Done. ${OUTPUT} updated."
echo "Now run: git add \"${OUTPUT}\" && git commit -m 'update CV' && git push"
