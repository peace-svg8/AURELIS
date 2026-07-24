import sys
try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Distance from white
            dist_to_white = ((255 - r) + (255 - g) + (255 - b)) / 3
            
            # If it's pure white, dist_to_white is 0
            if dist_to_white < 5:
                pixels[x, y] = (255, 255, 255, 0)
            else:
                # Anti-aliasing scaling
                alpha = int(min(255, dist_to_white * 2))
                pixels[x, y] = (r, g, b, alpha)
                
    img.save(output_path, "PNG")

if __name__ == "__main__":
    process_logo("logo.jfif", "public/logo.png")
