import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { supabase } from '@/lib/supabase';
import { sendToWhatsApp } from '@/lib/whatsapp';

const parser = new Parser({
    customFields: {
      item: ['media:content', 'enclosure'],
    }
  });

export async function POST() {
  try {
    const results: any[] = [];
    
    // 1. Get all active feeds (with user_id for context)
    const { data: feeds, error: feedsError } = await supabase
      .from('feeds')
      .select('*')
      .eq('is_active', true);

    if (feedsError) throw feedsError;
    if (!feeds || feeds.length === 0) {
      return NextResponse.json({ message: 'No active feeds to sync' });
    }

    for (const feed of feeds) {
      try {
        // 2. Fetch latest RSS items
        const rssFeed = await parser.parseURL(feed.url);
        
        // 3. For each item (limit to last 5 to avoid overloading)
        const items = rssFeed.items.slice(0, 5);
        let sentCount = 0;

        for (const item of items) {
          const guid = item.guid || item.link || '';
          
          // 4. Try inserting into 'posts' (unique constraint will catch duplicates)
          const { data: existingPost } = await supabase
            .from('posts')
            .select('id')
            .eq('feed_id', feed.id)
            .eq('guid', guid)
            .limit(1)
            .single();

          if (!existingPost) {
            // New Post! Send to WhatsApp
            const { success } = await sendToWhatsApp(feed.id, item, feed.message_template);
            
            if (success) {
               // Store as sent
               const { error: insertError } = await supabase
                 .from('posts')
                 .insert({
                   feed_id: feed.id,
                   guid,
                   title: item.title,
                   link: item.link,
                   status: 'sent'
                 });
               
               if (!insertError) sentCount++;
            }
          }
        }

        // 5. Update last_synced_at
        await supabase
          .from('feeds')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', feed.id);

        results.push({ feed: feed.name, status: 'success', sentCount });

      } catch (feedErr: any) {
        console.error(`Error syncing feed ${feed.name}:`, feedErr);
        results.push({ feed: feed.name, status: 'error', error: feedErr.message });
      }
    }

    return NextResponse.json({ 
      timestamp: new Date().toISOString(),
      results 
    });

  } catch (error: any) {
    console.error('Global Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
