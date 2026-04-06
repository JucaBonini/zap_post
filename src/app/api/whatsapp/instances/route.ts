import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { instanceName } = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL?.trim().replace(/\/$/, ""); // Remove barra final se existir
    const apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY?.trim();

    if (!apiUrl || !apiKey) {
      return NextResponse.json({ error: 'Configuração da Evolution API ausente' }, { status: 500 });
    }

    console.log(`[Proxy] Debug Host: ${apiUrl}`);
    console.log(`[Proxy] Debug Key (primeiros 4 chars): ${apiKey.substring(0, 4)}...`);

    const commonHeaders = {
      'Content-Type': 'application/json',
      'apikey': apiKey,
      'apiKey': apiKey,
      'Authorization': `Bearer ${apiKey}` // Caso o servidor esteja em modo JWT
    };

    // Lógica de "Tiro ao Alvo" em cascata para a versão da API
    const endpoints = [
      `${apiUrl}/instance/fetchInstances`,
      `${apiUrl}/v2/instance/fetchInstances`
    ];

    let testRes = null;
    let testData = null;
    let successEndpoint = '';

    for (const endpoint of endpoints) {
      console.log(`[Proxy] Testando endpoint: ${endpoint}`);
      // Tentando também via Query Param
      const diagnosticUrl = `${endpoint}?apikey=${apiKey}`;
      
      const res = await fetch(diagnosticUrl, {
        method: 'GET',
        headers: commonHeaders
      });
      if (res.ok) {
        testRes = res;
        testData = await res.json();
        successEndpoint = endpoint.replace('/instance/fetchInstances', '');
        break;
      }
    }

    if (testRes) {
      console.log(`[Proxy] SUCESSO NO DIAGNÓSTICO: Usando ${successEndpoint}`);
    } else {
      console.log(`[Proxy] FALHA TOTAL NO DIAGNÓSTICO (401 em todos)`);
    }

    // Usar o endpoint que funcionou ou o padrão
    const finalBaseUrl = successEndpoint || apiUrl;
    const finalCreateUrl = `${finalBaseUrl}/instance/create?apikey=${apiKey}`;

    // 1. Criar Instância
    const createRes = await fetch(finalCreateUrl, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify({ 
        instanceName, 
        qrcode: true
      })
    });

    const createData = await createRes.json();
    console.log('[Proxy] Resposta da criação:', createData);

    // Se já existe, prosseguimos para pegar o QR Code
    if (!createRes.ok && createData.message !== 'The instance already exists') {
      return NextResponse.json(createData, { status: createRes.status });
    }

    // 2. Pegar QR Code (ou Conectar)
    console.log(`[Proxy] Solicitando conexão para: ${instanceName}`);
    const connectRes = await fetch(`${apiUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: { 'apikey': apiKey }
    });

    const connectData = await connectRes.json();
    return NextResponse.json(connectData);

  } catch (error: any) {
    console.error('[Proxy] Erro geral:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
