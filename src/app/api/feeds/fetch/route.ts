import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const parser = new Parser({
      customFields: {
        item: ['media:content', 'enclosure'],
      }
    });

    const feed = await parser.parseURL(url);
    
    // Return only top 5 for demo
    const items = feed.items.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item.contentSnippet,
      guid: item.guid || item.link
    }));

    return NextResponse.json({ 
      title: feed.title,
      description: feed.description,
      items 
    });

  } catch (error: any) {
    console.error('RSS Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch RSS feed: ' + error.message }, { status: 500 });
  }
}
