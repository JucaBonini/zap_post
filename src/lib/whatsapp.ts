import { supabase } from './supabase';

/**
 * Handle sending messages to WhatsApp.
 * For now, this acts as a Mock to simulate the process, 
 * but it's ready to be expanded to a real API like Evolution API or similar.
 */
/**
 * Handle sending messages to WhatsApp.
 */
export async function sendToWhatsApp(feedId: string, item: any, template?: string) {
  try {
    // 1. Get user instance (assuming first active for now)
    const { data: instance } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('status', 'connected')
      .limit(1)
      .single();

    if (!instance) return { success: false, error: 'Instância não conectada' };

    // 2. Formatting (Using template or default)
    const defaultTemplate = `🚀 *Nova fofoca fresquinha!*\n\n*{{titulo}}*\n\n{{resumo}}...\n\n🔗 *Leia mais:* {{link}}\n\n_Enviado via RSS Flow ⚡_`;
    const finalTemplate = template || defaultTemplate;

    const message = finalTemplate
      .replace('{{titulo}}', item.title || 'Sem título')
      .replace('{{link}}', item.link || '')
      .replace('{{resumo}}', item.content?.substring(0, 150) || '');

    // 3. Mock Logging - this would be a real POST to a WhatsApp API
    console.log(`[WhatsApp Mock] Sending message to ${instance.instance_name}:`, message);

    // 4. Return success
    return { success: true, message };
  } catch (error) {
    console.error('Error sending to WhatsApp:', error);
    return { success: false, error };
  }
}
