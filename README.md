# Aplicativo de Tarefas com Flask e SQLite

Um aplicativo completo de gerenciamento de tarefas com backend REST API e interface web moderna.

## Funcionalidades

- **Gerenciamento de Tarefas**:
  - Criar, ler, atualizar e deletar tarefas
  - Marcar tarefas como completas/incompletas (pendente/concluída)
  - Detalhes da tarefa com título e descrição opcional

- **Interface do Usuário**:
  - Design limpo e moderno
  - Modo claro/escuro com preferência persistente
  - Layout responsivo para todos dispositivos
  - Animações e transições suaves

- **Backend**:
  - API RESTful JSON
  - Armazenamento em banco de dados SQLite
  - ORM SQLAlchemy

## Tecnologias Utilizadas

### Backend
- Python 3
- Flask 2.3.2
- Flask-SQLAlchemy 3.0.3
- SQLite

### Frontend
- HTML5
- CSS3 com variáveis para temas
- JavaScript (ES6)
- Fetch API para comunicação com backend

## Instalação

1. Clone este repositório:
   ```bash
   git clone https://github.com/yourusername/todo-app.git
   cd todo-app
   ```

2. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

## Uso

### Executando a Aplicação
```bash
python app.py
```

A aplicação estará disponível em:
- Interface web: `http://localhost:5000`
- URL base da API: `http://localhost:5000/api`

### Interface Web
1. Abra `http://localhost:5000` no seu navegador
2. Use o formulário para adicionar novas tarefas
3. Clique no botão de status para marcar tarefas como completas/incompletas
4. Clique no botão de deletar (✕) para remover tarefas
5. Alterne entre modo claro/escuro usando o ícone de lua/sol no cabeçalho

### Documentação da API

#### Criar uma Tarefa
`POST /tasks`
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pendente"
  }'
```

#### Listar Todas as Tarefas
`GET /tasks`
```bash
curl http://localhost:5000/tasks
```

#### Obter uma Tarefa Específica
`GET /tasks/<task_id>`
```bash
curl http://localhost:5000/tasks/1
```

#### Atualizar uma Tarefa
`PUT /tasks/<task_id>`
```bash
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task",
    "status": "concluida"
  }'
```

#### Deletar uma Tarefa
`DELETE /tasks/<task_id>`
```bash
curl -X DELETE http://localhost:5000/tasks/1
```

## Desenvolvimento

### Configuração do Banco de Dados
O banco de dados SQLite (`tasks.db`) é criado automaticamente na primeira execução. O esquema inclui:

```python
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default='pendente', nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
```

### Executando em Modo de Desenvolvimento
```bash
FLASK_ENV=development python app.py
```

### Desenvolvimento Frontend
- CSS utiliza variáveis modernas para temas
- JavaScript utiliza recursos ES6 e Fetch API
- Preferência de modo escuro é armazenada no localStorage

## Licença
Licença MIT - veja o arquivo [LICENSE](#) para detalhes
