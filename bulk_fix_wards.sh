#!/bin/bash

echo "=== Bulk Ward Name Fixes ==="

# Common case sensitivity fixes
echo "Fixing case sensitivity issues..."
sed -i '' 's/ Nagar/ NAGAR/g' "headers - total voter.csv"
sed -i '' 's/ Nagar,/ NAGAR,/g' "headers - total voter.csv"
sed -i '' 's/ Mile/ MILE/g' "headers - total voter.csv"
sed -i '' 's/ Mile,/ MILE,/g' "headers - total voter.csv"
sed -i '' 's/ Kavala/ KAVALA/g' "headers - total voter.csv"
sed -i '' 's/ Kavala,/ KAVALA,/g' "headers - total voter.csv"

# Common spacing fixes
echo "Fixing spacing issues..."
sed -i '' 's/ th MILE/TH MILE/g' "headers - total voter.csv"
sed -i '' 's/ th Mile/TH MILE/g' "headers - total voter.csv"
sed -i '' 's/TH MILE/TH MILE/g' "headers - total voter.csv"

# Common punctuation fixes
echo "Fixing punctuation issues..."
sed -i '' 's/ST JOSEPH/ST. JOSEPH/g' "headers - total voter.csv"
sed -i '' 's/ST MARY/ST. MARY/g' "headers - total voter.csv"
sed -i '' 's/ST ANTHONY/ST. ANTHONY/g' "headers - total voter.csv"

# Common ward name fixes
echo "Fixing specific ward names..."
sed -i '' 's/EMS Nagar/E.M.S NAGAR/g' "headers - total voter.csv"
sed -i '' 's/A K K Nagar/A.K.K NAGAR/g' "headers - total voter.csv"
sed -i '' 's/A R Nagar/A.R NAGAR/g' "headers - total voter.csv"

echo "Bulk fixes completed!"
