"""
Test SadTalker Video Generation
Quick script to verify SadTalker is working and generating realistic talking head videos
"""

import requests
import json
import base64
import time
from pathlib import Path

# Configuration
SADTALKER_SERVICE_URL = "http://localhost:5001"
TEST_OUTPUT_DIR = Path(__file__).parent / "test_outputs"
TEST_OUTPUT_DIR.mkdir(exist_ok=True)

def test_health_check():
    """Test if SadTalker service is running"""
    print("🔍 Testing SadTalker service health...")
    try:
        response = requests.get(f"{SADTALKER_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Service is healthy!")
            print(f"   Device: {data.get('device', 'unknown')}")
            print(f"   Model loaded: {data.get('model_loaded', False)}")
            return True
        else:
            print(f"❌ Service returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to SadTalker service!")
        print("   Make sure to start it with: python backend/services/sadtalkerService.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_quick_generate(text="Hello! Welcome to your interview today. I'm excited to speak with you."):
    """Test quick video generation"""
    print(f"\n🎬 Testing video generation...")
    print(f"   Text: '{text[:50]}...'")
    
    try:
        start_time = time.time()
        
        response = requests.post(
            f"{SADTALKER_SERVICE_URL}/api/avatar/quick-generate",
            json={"text": text},
            timeout=120  # 2 minutes max
        )
        
        generation_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Video generated in {generation_time:.2f} seconds!")
                
                # Save video
                video_base64 = data['video'].split(',')[1]
                video_bytes = base64.b64decode(video_base64)
                
                output_file = TEST_OUTPUT_DIR / f"test_video_{int(time.time())}.mp4"
                with open(output_file, 'wb') as f:
                    f.write(video_bytes)
                
                print(f"💾 Video saved to: {output_file}")
                print(f"   Duration: {data.get('duration', 'unknown')} seconds")
                print(f"\n🎥 Open the video to see the realistic talking head!")
                return True
            else:
                print(f"❌ Generation failed: {data}")
                return False
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out! Video generation is taking too long.")
        print("   This might mean:")
        print("   - Model is loading for the first time (can take 1-2 min)")
        print("   - GPU/CPU is slow")
        print("   - Try again in a moment")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_custom_avatar():
    """Test with custom avatar image"""
    print(f"\n🖼️  Testing with custom avatar...")
    
    # Use one of the example images
    sadtalker_path = Path(__file__).parent / "SadTalker"
    example_images = list((sadtalker_path / "examples" / "source_image").glob("*.png"))
    
    if not example_images:
        print("⚠️  No example images found, skipping custom avatar test")
        return False
    
    # Use the first example image
    avatar_image = example_images[0]
    print(f"   Using: {avatar_image.name}")
    
    try:
        # Read and encode image
        with open(avatar_image, 'rb') as f:
            image_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        # Initialize avatar
        response = requests.post(
            f"{SADTALKER_SERVICE_URL}/api/avatar/initialize",
            json={"avatarImage": f"data:image/png;base64,{image_base64}"},
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"✅ Custom avatar initialized!")
            
            # Generate video with this avatar
            return test_quick_generate("This is a test with a custom avatar image.")
        else:
            print(f"❌ Failed to initialize avatar: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("🧪 SadTalker Video Generation Test Suite")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Health check
    results['health'] = test_health_check()
    if not results['health']:
        print("\n❌ Service is not running. Cannot proceed with tests.")
        print("\n📝 To start the service, run:")
        print("   cd backend")
        print("   python services/sadtalkerService.py")
        return
    
    # Test 2: Basic generation
    time.sleep(1)
    results['basic_generation'] = test_quick_generate()
    
    # Test 3: Custom avatar
    time.sleep(2)
    results['custom_avatar'] = test_custom_avatar()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status} - {test_name.replace('_', ' ').title()}")
    
    total = len(results)
    passed = sum(results.values())
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! SadTalker is working perfectly!")
        print("   You can now use realistic talking head avatars in your interviews.")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
    
    print(f"\n📁 Generated videos are in: {TEST_OUTPUT_DIR}")

if __name__ == "__main__":
    run_all_tests()
