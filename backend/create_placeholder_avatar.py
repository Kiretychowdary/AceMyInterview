# NMKRSPVLIDATA
"""
Create a default placeholder avatar image for SadTalker
Generates a professional-looking avatar placeholder
"""

from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path

def create_placeholder_avatar(output_path, size=1024):
    """
    Create a placeholder avatar image
    
    Args:
        output_path: Path to save the image
        size: Image size (square)
    """
    # Create a new image with a professional gradient
    img = Image.new('RGB', (size, size), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Create gradient background (blue to purple)
    for y in range(size):
        r = int(100 + (y / size) * 100)
        g = int(150 + (y / size) * 50)
        b = int(200 + (y / size) * 55)
        draw.rectangle([(0, y), (size, y+1)], fill=(r, g, b))
    
    # Draw a circle for face area (lighter)
    center_x = size // 2
    center_y = int(size * 0.4)
    face_radius = int(size * 0.25)
    
    # Face circle
    draw.ellipse(
        [(center_x - face_radius, center_y - face_radius),
         (center_x + face_radius, center_y + face_radius)],
        fill=(240, 220, 200),
        outline=(220, 200, 180),
        width=3
    )
    
    # Draw eyes
    eye_y = center_y - int(face_radius * 0.2)
    eye_spacing = int(face_radius * 0.5)
    eye_size = int(face_radius * 0.15)
    
    # Left eye
    draw.ellipse(
        [(center_x - eye_spacing - eye_size, eye_y - eye_size),
         (center_x - eye_spacing + eye_size, eye_y + eye_size)],
        fill=(80, 80, 100)
    )
    
    # Right eye
    draw.ellipse(
        [(center_x + eye_spacing - eye_size, eye_y - eye_size),
         (center_x + eye_spacing + eye_size, eye_y + eye_size)],
        fill=(80, 80, 100)
    )
    
    # Draw mouth (smile)
    mouth_y = center_y + int(face_radius * 0.4)
    mouth_width = int(face_radius * 0.8)
    draw.arc(
        [(center_x - mouth_width//2, mouth_y - 20),
         (center_x + mouth_width//2, mouth_y + 20)],
        start=0,
        end=180,
        fill=(80, 80, 100),
        width=3
    )
    
    # Add text
    try:
        # Try to load a font
        font_size = int(size * 0.06)
        try:
            from PIL import ImageFont
            # Try common font paths
            font_paths = [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "C:\\Windows\\Fonts\\arial.ttf",
                "/System/Library/Fonts/Helvetica.ttc"
            ]
            font = None
            for font_path in font_paths:
                if os.path.exists(font_path):
                    font = ImageFont.truetype(font_path, font_size)
                    break
            if font is None:
                font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()
        
        text = "AI INTERVIEWER"
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_x = (size - text_width) // 2
        text_y = center_y + face_radius + int(size * 0.08)
        
        # Draw text with shadow
        draw.text((text_x + 2, text_y + 2), text, fill=(0, 0, 0, 128), font=font)
        draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
        
        # Add subtitle
        subtitle = "Powered by SadTalker"
        subtitle_bbox = draw.textbbox((0, 0), subtitle, font=font)
        subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
        subtitle_x = (size - subtitle_width) // 2
        subtitle_y = text_y + int(size * 0.05)
        draw.text((subtitle_x, subtitle_y), subtitle, fill=(220, 220, 220), font=font)
        
    except Exception as e:
        print(f"Could not add text: {e}")
    
    # Save the image
    img.save(output_path, 'PNG', quality=95)
    print(f"✅ Placeholder avatar created: {output_path}")
    print(f"   Size: {size}x{size} pixels")
    print(f"   Format: PNG")
    print("\n⚠️  IMPORTANT: Replace this with a real professional headshot!")
    print("   Recommended: Use a clear, front-facing portrait photo")
    print("   For best results: 512x512 or 1024x1024, good lighting, neutral background")

def main():
    """Create placeholder avatar in assets directory"""
    script_dir = Path(__file__).parent
    assets_dir = script_dir / "assets"
    assets_dir.mkdir(exist_ok=True)
    
    output_path = assets_dir / "default_avatar.png"
    
    if output_path.exists():
        response = input(f"⚠️  {output_path} already exists. Overwrite? (y/n): ")
        if response.lower() != 'y':
            print("❌ Cancelled")
            return
    
    create_placeholder_avatar(str(output_path), size=1024)
    
    print("\n📋 Next steps:")
    print("1. Replace the placeholder with a real professional headshot")
    print("2. Make sure the photo has good lighting and shows the face clearly")
    print("3. Use a front-facing portrait for best lip sync results")
    print("\n💡 Tip: You can use any professional headshot photo!")
    print("   Examples: Your photo, stock photo, or any human face")

if __name__ == "__main__":
    main()
