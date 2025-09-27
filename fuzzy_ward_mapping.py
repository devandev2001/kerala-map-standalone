#!/usr/bin/env python3
"""
Fuzzy Ward Mapping Script
Matches ward names between JSON files and CSV files using fuzzy string matching
"""

import csv
import json
import re
from difflib import SequenceMatcher
from collections import defaultdict

def similarity(a, b):
    """Calculate similarity between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def normalize_ward_name(name):
    """Normalize ward name for better matching"""
    # Remove extra spaces
    name = re.sub(r'\s+', ' ', name.strip())
    # Remove special characters but keep spaces
    name = re.sub(r'[^\w\s]', '', name)
    return name.upper()

def find_best_match(target_ward, csv_wards, threshold=0.8):
    """Find the best matching ward in CSV for a given JSON ward"""
    target_normalized = normalize_ward_name(target_ward)
    best_match = None
    best_score = 0
    
    for csv_ward in csv_wards:
        csv_normalized = normalize_ward_name(csv_ward)
        score = similarity(target_normalized, csv_normalized)
        
        if score > best_score and score >= threshold:
            best_score = score
            best_match = csv_ward
    
    return best_match, best_score

def load_csv_wards(csv_file):
    """Load all ward names from CSV file"""
    wards = set()
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        for row in reader:
            if len(row) > 5 and row[5].strip():
                wards.add(row[5].strip())
    return wards

def load_json_wards(json_dir):
    """Load all ward names from JSON files"""
    import os
    import glob
    
    wards = set()
    json_files = glob.glob(os.path.join(json_dir, "**/*.json"), recursive=True)
    
    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'features' in data:
                    for feature in data['features']:
                        if 'properties' in feature and 'Ward_Name' in feature['properties']:
                            ward_name = feature['properties']['Ward_Name'].strip()
                            if ward_name:
                                wards.add(ward_name)
        except Exception as e:
            print(f"Error reading {json_file}: {e}")
    
    return wards

def create_mapping():
    """Create fuzzy mapping between JSON and CSV wards"""
    print("Loading CSV wards...")
    csv_wards = load_csv_wards("headers - total voter.csv")
    print(f"Found {len(csv_wards)} wards in CSV")
    
    print("Loading JSON wards...")
    json_wards = load_json_wards("public/map/ward_jsons")
    print(f"Found {len(json_wards)} wards in JSON")
    
    # Find missing wards
    missing_wards = json_wards - csv_wards
    print(f"Found {len(missing_wards)} wards missing from CSV")
    
    # Create mappings
    mappings = {}
    unmatched = []
    
    print("\nCreating fuzzy mappings...")
    for i, missing_ward in enumerate(missing_wards):
        if i % 100 == 0:
            print(f"Processed {i}/{len(missing_wards)} wards...")
        
        best_match, score = find_best_match(missing_ward, csv_wards, threshold=0.7)
        
        if best_match:
            mappings[missing_ward] = best_match
            print(f"✓ {missing_ward} -> {best_match} (score: {score:.3f})")
        else:
            unmatched.append(missing_ward)
    
    print(f"\nMappings created: {len(mappings)}")
    print(f"Unmatched wards: {len(unmatched)}")
    
    return mappings, unmatched

def apply_mappings(mappings):
    """Apply the mappings to the CSV file"""
    print("\nApplying mappings to CSV file...")
    
    # Read the CSV file
    with open("headers - total voter.csv", 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Apply mappings
    for json_ward, csv_ward in mappings.items():
        # Replace CSV ward name with JSON ward name
        content = content.replace(f',{csv_ward},', f',{json_ward},')
        print(f"Replaced: {csv_ward} -> {json_ward}")
    
    # Write back to CSV
    with open("headers - total voter.csv", 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("CSV file updated successfully!")

def main():
    print("=== Fuzzy Ward Mapping Script ===")
    
    # Create mappings
    mappings, unmatched = create_mapping()
    
    # Save mappings to file
    with open("ward_mappings.json", 'w', encoding='utf-8') as f:
        json.dump({
            'mappings': mappings,
            'unmatched': unmatched,
            'total_mappings': len(mappings),
            'total_unmatched': len(unmatched)
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\nMappings saved to ward_mappings.json")
    
    # Apply mappings
    if mappings:
        apply_mappings(mappings)
    
    # Show unmatched wards
    if unmatched:
        print(f"\nUnmatched wards ({len(unmatched)}):")
        for ward in sorted(unmatched)[:20]:  # Show first 20
            print(f"  - {ward}")
        if len(unmatched) > 20:
            print(f"  ... and {len(unmatched) - 20} more")

if __name__ == "__main__":
    main()
