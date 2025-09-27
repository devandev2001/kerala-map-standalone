#!/bin/bash

# Quick compression script for ward JSON files
echo "Compressing ward JSON files..."

# Create compressed directory
mkdir -p public/map/ward_jsons_compressed

# Compress all JSON files
find public/map/ward_jsons -name "*.json" -exec gzip -c {} \; -exec sh -c 'echo "$1" | sed "s/\.json$/.json.gz/" | xargs -I {} cp /dev/stdin "public/map/ward_jsons_compressed/{}"' _ {} \;

# Calculate sizes
original_size=$(du -sh public/map/ward_jsons | cut -f1)
compressed_size=$(du -sh public/map/ward_jsons_compressed | cut -f1)

echo "Original size: $original_size"
echo "Compressed size: $compressed_size"
echo "Compressed files saved to: public/map/ward_jsons_compressed"
