// api/client-api.js
import { get } from '@vercel/blob'; // Importa o Vercel Blob

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { action, key } = request.body;

        if (action === 'validate_key') {
            if (!key) throw new Error('Chave não fornecida');

            // --- LÓGICA DO VERCEL BLOB ---
            // Tenta pegar a chave do Vercel Blob
            const blob = await get(key, {
                token: process.env.BLOB_READ_WRITE_TOKEN // Vercel injeta isso
            });
            
            const expiresAtString = await blob.text();
            // ---------------------------------

            if (!expiresAtString) {
                throw new Error('Chave inválida');
            }

            const expiresAt = new Date(expiresAtString);
            
            if (expiresAt < new Date()) {
                throw new Error('Chave expirada');
            }

            // Sucesso!
            return response.status(200).json({ 
                message: 'Chave válida!', 
                expiresAt: expiresAtString
            });
        }

        throw new Error('Ação desconhecida');

    } catch (err) {
        // Se 'get' falhar (chave não existe), ele também cai aqui
        if (err.message.includes('BlobNotFoundError')) {
            return response.status(400).json({ error: 'Chave inválida' });
        }
        return response.status(400).json({ error: err.message || 'Erro desconhecido' });
    }
}