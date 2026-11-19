// EduPizzaria - Servidor backend
// Objetivo: expor uma API simples para o frontend consumir clientes e perguntas educativas.
//
// Implementação sugerida:
// 1) Importar dependências (ex.: express, cors, path/fs) e criar a aplicação.
// 2) Configurar middlewares (CORS, express.json, logs básicos se necessário).
// 3) Carregar dados de ./data/customers.json e ./data/questions.json.
// 4) Definir rotas/endpoints, por exemplo:
//    - GET /api/health        -> status do servidor
//    - GET /api/customers     -> lista de clientes (Mia, Theo, Sofia)
//    - GET /api/questions     -> lista de perguntas de Matemática e Português
// 5) Tratar erros (404, falha ao ler JSON) e iniciar o servidor na porta configurada.

const PORT = process.env.PORT || 3000;

// TODO: inicializar app/rotas e substituir este log pelo app.listen(...)
console.log(`Servidor EduPizzaria (backend) previsto na porta ${PORT}`);
