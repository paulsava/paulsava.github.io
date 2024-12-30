#!/usr/bin/env python3
import os
import glob
import markdown
from datetime import datetime
from xml.etree import ElementTree as ET
from xml.dom import minidom

def parse_markdown_metadata(content):
    """Extract metadata from markdown file."""
    lines = content.split('\n')
    metadata = {}
    if lines[0] == '---':
        end_meta = lines[1:].index('---') + 1
        meta_lines = lines[1:end_meta]
        for line in meta_lines:
            if ':' in line:
                key, value = line.split(':', 1)
                metadata[key.strip()] = value.strip()
        content = '\n'.join(lines[end_meta + 1:])
    return metadata, content

def generate_rss():
    """Generate RSS feed from markdown blog posts."""
    # Create the RSS element
    rss = ET.Element('rss', {'version': '2.0', 'xmlns:atom': 'http://www.w3.org/2005/Atom'})
    channel = ET.SubElement(rss, 'channel')
    
    # Add channel metadata
    ET.SubElement(channel, 'title').text = "Paul Sava's Blog"
    ET.SubElement(channel, 'description').text = "Thoughts on AI Security, Machine Learning, and beyond"
    ET.SubElement(channel, 'link').text = 'https://paulsava.github.io'
    ET.SubElement(channel, 'atom:link', {
        'href': 'https://paulsava.github.io/feed.xml',
        'rel': 'self',
        'type': 'application/rss+xml'
    })
    
    now = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S +0000')
    ET.SubElement(channel, 'pubDate').text = now
    ET.SubElement(channel, 'lastBuildDate').text = now
    ET.SubElement(channel, 'generator').text = 'GitHub Actions RSS Generator'
    
    # Process all markdown files in the blog directory
    blog_files = glob.glob('src/blog/*.md')
    posts = []
    
    for file_path in blog_files:
        if 'template.md' in file_path:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        metadata, content = parse_markdown_metadata(content)
        if not metadata:
            continue
            
        # Convert markdown to HTML
        html_content = markdown.markdown(content)
        
        # Create item element
        item = ET.SubElement(channel, 'item')
        ET.SubElement(item, 'title').text = metadata.get('title', 'Untitled')
        
        # Generate link from filename
        filename = os.path.basename(file_path).replace('.md', '.html')
        link = f'https://paulsava.github.io/blog/{filename}'
        ET.SubElement(item, 'link').text = link
        
        # Use file modification time if date not in metadata
        pub_date = metadata.get('date', datetime.fromtimestamp(os.path.getmtime(file_path)).strftime('%a, %d %b %Y %H:%M:%S +0000'))
        ET.SubElement(item, 'pubDate').text = pub_date
        
        ET.SubElement(item, 'guid', {'isPermaLink': 'true'}).text = link
        ET.SubElement(item, 'description').text = metadata.get('description', html_content[:200] + '...')
    
    # Create the XML string
    xml_str = minidom.parseString(ET.tostring(rss)).toprettyxml(indent='    ')
    
    # Write to file
    with open('src/feed.xml', 'w', encoding='utf-8') as f:
        f.write(xml_str)

if __name__ == '__main__':
    generate_rss() 