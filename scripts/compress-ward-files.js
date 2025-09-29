#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Function to simplify coordinates (reduce decimal places)
function simplifyCoordinates(coords, precision = 6) {
  if (Array.isArray(coords[0])) {
    return coords.map(coord => simplifyCoordinates(coord, precision));
  }
  return coords.map(coord => Math.round(coord * Math.pow(10, precision)) / Math.pow(10, precision));
}

// Function to simplify GeoJSON
function simplifyGeoJSON(geojson, precision = 6) {
  if (geojson.features) {
    geojson.features.forEach(feature => {
      if (feature.geometry && feature.geometry.coordinates) {
        feature.geometry.coordinates = simplifyCoordinates(feature.geometry.coordinates, precision);
      }
    });
  }
  return geojson;
}

// Function to compress a single file
function compressFile(inputPath, outputPath, precision = 6) {
  try {
    const data = fs.readFileSync(inputPath, 'utf8');
    const geojson = JSON.parse(data);
    
    // Simplify coordinates
    const simplified = simplifyGeoJSON(geojson, precision);
    
    // Write compressed version
    const compressed = zlib.gzipSync(JSON.stringify(simplified));
    fs.writeFileSync(outputPath, compressed);
    
    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log(`${path.basename(inputPath)}: ${originalSize} → ${compressedSize} bytes (${reduction}% reduction)`);
    
    return { originalSize, compressedSize, reduction };
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    return null;
  }
}

// Main function
function compressWardFiles() {
  const wardDir = 'public/map/ward_jsons';
  const outputDir = 'public/map/ward_jsons_compressed';
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let totalOriginal = 0;
  let totalCompressed = 0;
  let fileCount = 0;
  
  function processDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativeItemPath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Create subdirectory in output
        const outputSubDir = path.join(outputDir, relativeItemPath);
        if (!fs.existsSync(outputSubDir)) {
          fs.mkdirSync(outputSubDir, { recursive: true });
        }
        processDirectory(fullPath, relativeItemPath);
      } else if (item.endsWith('.json')) {
        // Compress JSON file
        const outputPath = path.join(outputDir, relativeItemPath + '.gz');
        const result = compressFile(fullPath, outputPath, 6); // 6 decimal places
        
        if (result) {
          totalOriginal += result.originalSize;
          totalCompressed += result.compressedSize;
          fileCount++;
        }
      }
    });
  }
  
  console.log('Compressing ward JSON files...\n');
  processDirectory(wardDir);
  
  const totalReduction = ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1);
  
  console.log(`\n=== COMPRESSION SUMMARY ===`);
  console.log(`Files processed: ${fileCount}`);
  console.log(`Total original size: ${(totalOriginal / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Total compressed size: ${(totalCompressed / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Total reduction: ${totalReduction}%`);
  console.log(`\nCompressed files saved to: ${outputDir}`);
}

// Run if called directly
if (require.main === module) {
  compressWardFiles();
}

module.exports = { compressWardFiles, compressFile };

