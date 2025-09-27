#!/bin/bash

echo "Starting ward JSON compression..."

# Create output directory
mkdir -p public/map/ward_jsons_compressed

# Get original size
original_size=$(du -sh public/map/ward_jsons | cut -f1)
echo "Original size: $original_size"

# Compress all JSON files
echo "Compressing files..."
find public/map/ward_jsons -name "*.json" -type f | while read file; do
    # Create relative path for output
    rel_path=${file#public/map/ward_jsons/}
    output_file="public/map/ward_jsons_compressed/${rel_path}.gz"
    
    # Create output directory if it doesn't exist
    mkdir -p "$(dirname "$output_file")"
    
    # Compress the file
    gzip -c "$file" > "$output_file"
    
    # Show progress
    echo "Compressed: $rel_path"
done

# Get compressed size
compressed_size=$(du -sh public/map/ward_jsons_compressed | cut -f1)
echo ""
echo "=== COMPRESSION COMPLETE ==="
echo "Original size: $original_size"
echo "Compressed size: $compressed_size"
echo "Files saved to: public/map/ward_jsons_compressed"
