import pandas as pd

# Path to your CSV
csv_path = "evaluation_data.csv"

# Load CSV
df = pd.read_csv(csv_path)

# Add epoch column (all values = 0)
df.insert(0, "epoch", 0)

# Save back
df.to_csv(csv_path, index=False)

print("✅ epoch column added successfully!")