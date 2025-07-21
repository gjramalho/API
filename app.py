from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy 
import os 

# Configuração do Flask
app = Flask(__name__)

# Configuração do banco de dados SQLite
# BASEDIR é o diretório onde o arquivo do banco será salvo
BASEDIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASEDIR, 'tasks.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False #Para evitar warnings do SQLAlchemy (IMPORTANTE)

db = SQLAlchemy(app)


# --- Modelo do Banco de Dados (Tabela de Tarefas) ---
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default='pendente', nullable=False) # Ex: 'pendente', 'concluida'
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    completed_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f'<Task {self.id}: {self.title}>'

    # Converte o objeto Task para formato JSON
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
# Rotas da API (Endpoints disponíveis)

# Cria uma nova tarefa (POST)
@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    if not data or not 'title' in data:
        return jsonify({"message": "titulo da tarefa é obrigatório!"}), 400
    
    new_task = Task(
        title=data['title'],
        description=data.get('description'),
        status=data.get('status', 'pendente')
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201 #201 criado

# Lista todas as tarefas (GET)
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

# Obtém uma tarefa específica pelo ID (GET)
@app.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict())

# Atualiza uma tarefa existente (PUT)
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()

    if 'title' in data:
        task.title = data['title']
    if 'description' in data: 
        task.description = data['description']
    if 'status' in data:
        task.status = data['status']
        if data['status'] == 'concluida' and not task.completed_at:
            task.completed_at = db.func.current_timestamp()
        elif data['status'] == 'pendente':
            task.completed_at = None

    db.session.commit()
    return jsonify(task.to_dict())

# Remove uma tarefa (DELETE)
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Tarefa deletada com sucesso!"}), 204 


# Rota principal que renderiza a página HTML
@app.route('/')
def index():
    return render_template('index.html')

# Inicializa o servidor Flask

if __name__ == '__main__':
    with app.app_context():
        # Cria as tabelas no banco de dados se não existirem
        db.create_all()
    app.run(debug=True) # debug=True reinicia o servidor automaticamente e mostra erros detalhados
