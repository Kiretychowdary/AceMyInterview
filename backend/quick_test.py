"""
Quick Test - Generate ONE realistic talking video
"""
import requests
import json
import base64
from pathlib import Path

print("🎬 Testing realistic avatar generation...\n")

# Test text
text = "Hello! Welcome to your interview. I'm looking forward to our conversation today."

print(f"📝 Generating video for: '{text[:50]}...'\n")
print("⏳ Please wait, this might take 30-60 seconds for first generation...")
print("   (Model needs to load into memory)\n")

try:
    response = requests.post(
        "http://localhost:5001/api/avatar/quick-generate",
        json={"text": text},
        timeout=180  # 3 minutes max
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print("✅ SUCCESS! Realistic video generated!\n")
            
            # Save the video
            video_base64 = data['video'].split(',')[1]
            video_bytes = base64.b64decode(video_base64)
            
            output_file = Path("test_realistic_avatar.mp4")
            with open(output_file, 'wb') as f:
                f.write(video_bytes)
            
            print(f"💾 Video saved as: {output_file.absolute()}")
            print(f"🎥 Duration: {data.get('duration', 'unknown')} seconds")
            print("\n" + "="*60)
            print("🎉 OPEN THE VIDEO FILE TO SEE YOUR REALISTIC AVATAR!")
            print("="*60)
            print("\nYou should see a REAL HUMAN FACE with:")
            print("  ✅ Perfect lip-sync")
            print("  ✅ Natural facial expressions")
            print("  ✅ Eye movements")
            print("  ✅ Realistic skin and lighting")
        else:
            print(f"❌ Generation failed: {data}")
    else:
        print(f"❌ Request failed: {response.status_code}")
        print(response.text)
        
except requests.exceptions.Timeout:
    print("❌ Timeout! The server is taking too long.")
    print("   This usually means:")
    print("   • Model is still loading (try again in 1 minute)")
    print("   • Your CPU is slow (consider using GPU)")
except Exception as e:
    print(f"❌ Error: {e}")
