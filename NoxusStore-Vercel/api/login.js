// api/login.js
// Esta é a sintaxe da Vercel (export default)

export default async function handler(request, response) {
    // Pega os logins e senhas do "cofre" da Vercel
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { username, password } = request.body;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Sucesso! Retorna o token de sessão
            const token = Buffer.from(`${username}:${password}`).toString('base64');
            return response.status(200).json({ message: 'Login com sucesso!', token: token });
        } else {
            throw new Error('Usuário ou senha inválidos');
        }
    } catch (err) {
        return response.status(401).json({ error: err.message || 'Erro desconhecido' });
    }
}