// api/admin-api.js
import { put } from '@vercel/blob'; // Importa o Vercel Blob
import { v4 as uuidv4 } from 'uuid';

// Pega os logins e senhas do "cofre" da Vercel
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const adminToken = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // 1. VERIFICAR SE É O ADMIN
        const token = request.headers.authorization?.split(' ')[1];
        if (!token || token !== adminToken) {
            return response.status(401).json({ error: 'Token de admin inválido' });
        }

        const { action, days } = request.body;

        // 2. EXECUTAR A AÇÃO DO ADMIN
        if (action === 'generate_key') {
            const key = `NOXUS-${uuidv4().split('-')[1].toUpperCase()}-${uuidv4().split('-')[1].toUpperCase()}`;
            const daysToAdd = parseInt(days) || 30;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + daysToAdd);

            // --- LÓGICA DO VERCEL BLOB ---
            // Salva a chave no Vercel Blob
            // O nome do "arquivo" é a chave
            // O conteúdo do "arquivo" é a data de expiração
            await put(key, expiresAt.toISOString(), {
                access: 'public', // Necessário para 'get' funcionar
                token: process.env.BLOB_READ_WRITE_TOKEN // Vercel injeta isso automaticamente
            });
            // ---------------------------------

            return response.status(200).json({ message: 'Chave gerada!', key: key });
        }

        throw new Error('Ação desconhecida');

    } catch (err) {
        return response.status(500).json({ error: err.message || 'Erro do servidor' });
    }
}