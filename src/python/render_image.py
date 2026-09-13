import sys
import pyembroidery

if len(sys.argv) == 3:
    pes_file = sys.argv[1]
    png_file = sys.argv[2]
    pattern = pyembroidery.read(pes_file)
    pyembroidery.write_png(pattern, png_file)