"""
SadTalker Service - Real-time Avatar Animation with Lip Sync
Integrates SadTalker for generating realistic talking head videos
"""

import os
import sys
import torch
import numpy as np
from pathlib import Path
import cv2
import base64
from io import BytesIO
from PIL import Image
import json
import asyncio
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import threading
import queue
import tempfile
import time

# Add SadTalker to path (assuming it's cloned in the backend directory)
SADTALKER_PATH = Path(__file__).parent.parent / "SadTalker"
sys.path.append(str(SADTALKER_PATH))

try:
    from inference import SadTalker as SadTalkerInference
except ImportError:
    print("Warning: SadTalker not found. Please clone it first.")
    SadTalkerInference = None

app = Flask(__name__)
CORS(app)

class AvatarVideoGenerator:
    """Generates realistic talking head videos with lip sync"""
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.avatar_image_path = None
        self.video_queue = queue.Queue(maxsize=10)
        
        # Default avatar image path - use SadTalker example image
        examples_path = SADTALKER_PATH / "examples" / "source_image"
        default_images = list(examples_path.glob("full*.png")) + list(examples_path.glob("full*.jpeg"))
        
        if default_images:
            self.default_avatar = str(default_images[0])
            print(f"✅ Using default avatar: {self.default_avatar}")
        else:
            # Fallback to any png in examples
            all_images = list(examples_path.glob("*.png"))
            self.default_avatar = str(all_images[0]) if all_images else None
            if self.default_avatar:
                print(f"✅ Using default avatar: {self.default_avatar}")
            else:
                print("⚠️  No default avatar found!")
        
    def initialize_model(self):
        """Initialize SadTalker model"""
        if SadTalkerInference is None:
            raise Exception("SadTalker not installed. Run setup script first.")
            
        try:
            checkpoint_path = SADTALKER_PATH / "checkpoints"
            self.model = SadTalkerInference(
                checkpoint_path=str(checkpoint_path),
                config_path=str(SADTALKER_PATH / "src" / "config"),
                device=self.device
            )
            print(f"✅ SadTalker initialized on {self.device}")
        except Exception as e:
            print(f"❌ Error initializing SadTalker: {e}")
            raise
    
    def set_avatar_image(self, image_data):
        """
        Set custom avatar image from base64 or file path
        
        Args:
            image_data: base64 string or file path
        """
        try:
            if image_data.startswith('data:image'):
                # Base64 image
                img_str = image_data.split(',')[1]
                img_bytes = base64.b64decode(img_str)
                img = Image.open(BytesIO(img_bytes))
                
                # Save temporarily
                temp_path = Path(tempfile.gettempdir()) / "avatar_temp.png"
                img.save(temp_path)
                self.avatar_image_path = str(temp_path)
            else:
                # File path
                self.avatar_image_path = image_data
                
            print(f"✅ Avatar image set: {self.avatar_image_path}")
            return True
        except Exception as e:
            print(f"❌ Error setting avatar image: {e}")
            return False
    
    def generate_talking_video(self, audio_path, output_path=None, preprocess='crop', 
                               still_mode=False, use_enhancer=False):
        """
        Generate talking head video from audio
        
        Args:
            audio_path: Path to audio file (WAV, MP3)
            output_path: Output video path (optional)
            preprocess: 'crop' or 'resize' or 'full'
            still_mode: Use still mode (less head movement)
            use_enhancer: Use GFPGAN face enhancer
            
        Returns:
            Path to generated video
        """
        if self.model is None:
            self.initialize_model()
            
        if self.avatar_image_path is None:
            self.avatar_image_path = str(self.default_avatar)
            
        try:
            if output_path is None:
                output_path = Path(tempfile.gettempdir()) / f"avatar_output_{int(time.time())}.mp4"
            
            # Generate video using SadTalker
            result = self.model.test(
                source_image=self.avatar_image_path,
                driven_audio=audio_path,
                preprocess=preprocess,
                still_mode=still_mode,
                use_enhancer=use_enhancer,
                result_dir=str(Path(output_path).parent),
                save_dir=str(Path(output_path).parent)
            )
            
            print(f"✅ Video generated: {result}")
            return result
            
        except Exception as e:
            print(f"❌ Error generating video: {e}")
            raise
    
    def stream_video_frames(self, video_path):
        """
        Stream video frames as base64 for real-time display
        
        Args:
            video_path: Path to generated video
            
        Yields:
            Base64 encoded frames
        """
        try:
            cap = cv2.VideoCapture(str(video_path))
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            frame_delay = 1.0 / fps
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Encode frame to base64
                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                
                yield frame_base64
                time.sleep(frame_delay)
            
            cap.release()
            
        except Exception as e:
            print(f"❌ Error streaming video: {e}")
            raise

# Global generator instance
generator = AvatarVideoGenerator()

@app.route('/api/avatar/initialize', methods=['POST'])
def initialize_avatar():
    """Initialize avatar with custom image"""
    try:
        data = request.json
        avatar_image = data.get('avatarImage', None)
        
        if avatar_image:
            success = generator.set_avatar_image(avatar_image)
            if not success:
                return jsonify({'error': 'Failed to set avatar image'}), 400
        
        # Initialize model if not already done
        if generator.model is None:
            generator.initialize_model()
        
        return jsonify({
            'success': True,
            'message': 'Avatar initialized successfully',
            'device': generator.device
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/avatar/generate', methods=['POST'])
def generate_avatar_video():
    """Generate talking head video from text/audio"""
    try:
        data = request.json
        text = data.get('text', '')
        audio_base64 = data.get('audio', None)
        
        # Handle audio input
        if audio_base64:
            # Decode audio from base64
            audio_bytes = base64.b64decode(audio_base64.split(',')[1] if ',' in audio_base64 else audio_base64)
            audio_path = Path(tempfile.gettempdir()) / f"audio_{int(time.time())}.wav"
            with open(audio_path, 'wb') as f:
                f.write(audio_bytes)
        else:
            # Generate audio from text using TTS
            from gtts import gTTS
            audio_path = Path(tempfile.gettempdir()) / f"tts_{int(time.time())}.mp3"
            tts = gTTS(text=text, lang='en', slow=False)
            tts.save(str(audio_path))
        
        # Generate video
        video_path = generator.generate_talking_video(
            str(audio_path),
            preprocess=data.get('preprocess', 'crop'),
            still_mode=data.get('stillMode', False),
            use_enhancer=data.get('useEnhancer', True)
        )
        
        # Return video path or base64
        if data.get('returnBase64', False):
            with open(video_path, 'rb') as f:
                video_base64 = base64.b64encode(f.read()).decode('utf-8')
            return jsonify({
                'success': True,
                'video': f"data:video/mp4;base64,{video_base64}",
                'videoPath': str(video_path)
            })
        else:
            return jsonify({
                'success': True,
                'videoPath': str(video_path),
                'videoId': Path(video_path).stem
            })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/avatar/stream/<video_id>')
def stream_avatar_video(video_id):
    """Stream avatar video frames in real-time"""
    try:
        video_path = Path(tempfile.gettempdir()) / f"{video_id}.mp4"
        
        if not video_path.exists():
            return jsonify({'error': 'Video not found'}), 404
        
        def generate_frames():
            for frame in generator.stream_video_frames(video_path):
                yield f"data: {json.dumps({'frame': frame})}\n\n"
        
        return Response(
            generate_frames(),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/avatar/quick-generate', methods=['POST'])
def quick_generate():
    """
    Quick generation with low latency for real-time interviews
    Uses optimized settings for speed
    """
    try:
        data = request.json
        text = data.get('text', '')
        
        # Generate audio quickly
        from gtts import gTTS
        audio_path = Path(tempfile.gettempdir()) / f"quick_tts_{int(time.time())}.mp3"
        tts = gTTS(text=text, lang='en', slow=False)
        tts.save(str(audio_path))
        
        # Generate with fast settings
        video_path = generator.generate_talking_video(
            str(audio_path),
            preprocess='crop',
            still_mode=True,  # Less head movement = faster
            use_enhancer=False  # Disable enhancer for speed
        )
        
        # Convert to base64 for immediate use
        with open(video_path, 'rb') as f:
            video_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        # Get video duration
        cap = cv2.VideoCapture(str(video_path))
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        duration = frame_count / fps if fps > 0 else 0
        cap.release()
        
        return jsonify({
            'success': True,
            'video': f"data:video/mp4;base64,{video_base64}",
            'duration': duration,
            'videoPath': str(video_path)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'device': generator.device,
        'model_loaded': generator.model is not None
    })

if __name__ == '__main__':
    print("🚀 Starting SadTalker Avatar Service...")
    print(f"📍 Device: {generator.device}")
    print(f"📂 SadTalker Path: {SADTALKER_PATH}")
    
    # Start Flask server
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )
