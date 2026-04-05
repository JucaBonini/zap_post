import { supabase } from './supabase';

/**
 * Handle sending messages to WhatsApp.
 * For now, this acts as a Mock to simulate the process, 
 * but it's ready to be expanded to a real API like Evolution API or similar.
 */
/**
 * Handle sending messages to WhatsApp via Evolution API.
 */
export async function sendToWhatsApp(feedId: string, item: any, template?: string, targetJid?: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
    const apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY;

    if (!apiUrl || !apiKey) {
       console.error('Configuração da Evolution API ausente nos envs.');
       return { success: false, error: 'Erro de configuração no servidor' };
    }

    // 1. Get the connected instance from Supabase
    const { data: instance } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('status', 'connected')
      .limit(1)
      .single();

    if (!instance) return { success: false, error: 'Nenhuma instância conectada no Dashboard' };

    // 2. Formatting the message
    const defaultTemplate = `🚀 *Nova fofoca fresquinha!*\n\n*{{titulo}}*\n\n{{resumo}}...\n\n🔗 *Leia mais:* {{link}}\n\n_Enviado via RSS Flow ⚡_`;
    const finalTemplate = template || defaultTemplate;

    const message = finalTemplate
      .replace('{{titulo}}', item.title || 'Sem título')
      .replace('{{link}}', item.link || '')
      .replace('{{resumo}}', item.content?.substring(0, 150) || '');

    // 3. REAL POST to Evolution API
    const target = targetJid || instance.instance_name;

    const response = await fetch(`${apiUrl}/message/sendText/${instance.instance_name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: target,
        text: message,
        linkPreview: true
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[WhatsApp Real] Mensagem enviada com sucesso para ${instance.instance_name}`);
      return { success: true, data };
    } else {
      console.error('[WhatsApp API Error]:', data);
      return { success: false, error: data };
    }

  } catch (error) {
    console.error('Error sending to WhatsApp:', error);
    return { success: false, error };
  }
}
