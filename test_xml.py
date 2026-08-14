import xml.etree.ElementTree as ET
import glob

files = glob.glob('backend/src/main/resources/templates/resume/*.html')
for f in files:
    try:
        ET.parse(f)
        print(f + ' -> OK')
    except Exception as e:
        print(f + ' -> ERROR: ' + str(e))
