#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Function to merge all ward files into a single optimized file
function mergeWardFiles() {
  const wardDir = 'public/map/ward_jsons';
  const outputFile = 'public/map/ward_jsons_merged.json.gz';
  
  const mergedData = {
    type: "FeatureCollection",
    name: "Kerala Wards Merged",
    features: []
  };
  
  let totalSize = 0;
  let fileCount = 0;
  
  function processDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.json')) {
        try {
          const data = fs.readFileSync(fullPath, 'utf8');
          const geojson = JSON.parse(data);
          
          if (geojson.features) {
            // Add district/panchayat info to each feature
            const pathParts = fullPath.split('/');
            const district = pathParts[pathParts.length - 3];
            const panchayatType = pathParts[pathParts.length - 2];
            const panchayatName = pathParts[pathParts.length - 1].replace('.json', '');
            
            geojson.features.forEach(feature => {
              feature.properties = feature.properties || {};
              feature.properties.district = district;
              feature.properties.panchayatType = panchayatType;
              feature.properties.panchayatName = panchayatName;
            });
            
            mergedData.features.push(...geojson.features);
          }
          
          totalSize += stat.size;
          fileCount++;
        } catch (error) {
          console.error(`Error processing ${fullPath}:`, error.message);
        }
      }
    });
  }
  
  console.log('Merging ward JSON files...\n');
  processDirectory(wardDir);
  
  // Compress the merged file
  const compressed = zlib.gzipSync(JSON.stringify(mergedData));
  fs.writeFileSync(outputFile, compressed);
  
  const compressedSize = fs.statSync(outputFile).size;
  const reduction = ((totalSize - compressedSize) / totalSize * 100).toFixed(1);
  
  console.log(`\n=== MERGE SUMMARY ===`);
  console.log(`Files merged: ${fileCount}`);
  console.log(`Total original size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Merged compressed size: ${(compressedSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Total reduction: ${reduction}%`);
  console.log(`\nMerged file saved to: ${outputFile}`);
  console.log(`Features count: ${mergedData.features.length}`);
}

// Run if called directly
if (require.main === module) {
  mergeWardFiles();
}

module.exports = { mergeWardFiles };

