import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function Modal({ receita, onClose }) {
  if (!receita) return null;

  const ingredientes = Array.isArray(receita.ingredientes)
    ? receita.ingredientes
    : (receita.ingredientes ? receita.ingredientes.split('\n') : []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{receita.nome || receita.titulo}</h2>
        <h3>Ingredientes:</h3>
        <ul>
          {ingredientes.map((ingrediente, idx) => (
            <li key={idx}>{ingrediente}</li>
          ))}
        </ul>
        <h3>Modo de Preparo:</h3>
        <p>{receita.modoFazer || receita.modoPreparo}</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

function App() {
  const [receitas, setReceitas] = useState([]);
  const [modalReceita, setModalReceita] = useState(null);
  const [erro, setErro] = useState(false);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [novaReceita, setNovaReceita] = useState({
    nome: '',
    tipo: 'DOCE',
    ingredientes: '',
    modoFazer: '',
    img: '',
    custoAproximado: 0,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setNovaReceita(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const receitaParaEnviar = {
      nome: novaReceita.nome,
      tipo: novaReceita.tipo,
      ingredientes: novaReceita.ingredientes,
      modoFazer: novaReceita.modoFazer,
      img: novaReceita.img,
      custoAproximado: Number(novaReceita.custoAproximado),
    };

    console.log('Enviando para API:', receitaParaEnviar);

    try {
      await axios.post('https://receitasapi-b-2025.vercel.app/receitas', receitaParaEnviar);
      setNovaReceita({
        nome: '',
        tipo: 'DOCE',
        ingredientes: '',
        modoFazer: '',
        img: '',
        custoAproximado: 0,
      });
      setMostrarForm(false);

      // Recarrega lista
      const response = await axios.get('https://receitasapi-b-2025.vercel.app/receitas');
      setReceitas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      alert('Erro ao cadastrar receita! Veja o console.');
      console.error(error.response?.data || error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://receitasapi-b-2025.vercel.app/receitas');
        if (Array.isArray(response.data)) {
          setReceitas(response.data);
          setErro(false);
        } else {
          setReceitas([]);
          setErro(true);
        }
      } catch (error) {
        console.error('Erro ao buscar receitas:', error);
        setReceitas([]);
        setErro(true);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <header>
        <h1>Receitas</h1>
        <button onClick={() => setMostrarForm(true)}>Cadastrar Receita</button>
      </header>

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="form-cadastro">
          <input type="text" name="nome" placeholder="Nome" value={novaReceita.nome} onChange={handleChange} required />
          <select name="tipo" value={novaReceita.tipo} onChange={handleChange}>
            <option value="DOCE">Doce</option>
            <option value="SALGADA">Salgada</option>
            <option value="BEBIDA">Bebida</option>
          </select>
          <textarea name="ingredientes" placeholder="Ingredientes (1 por linha)" value={novaReceita.ingredientes} onChange={handleChange} required />
          <textarea name="modoFazer" placeholder="Modo de preparo" value={novaReceita.modoFazer} onChange={handleChange} required />
          <input type="text" name="img" placeholder="URL da imagem" value={novaReceita.img} onChange={handleChange} />
          <input type="number" step="0.01" name="custoAproximado" placeholder="Custo" value={novaReceita.custoAproximado} onChange={handleChange} />
          <button type="submit">Salvar</button>
          <button type="button" onClick={() => setMostrarForm(false)}>Cancelar</button>
        </form>
      )}

      <main className="card-container">
        {erro ? (
          <p style={{ color: 'red' }}>Erro ao carregar receitas.</p>
        ) : receitas.length === 0 ? (
          <p>Nenhuma receita encontrada.</p>
        ) : (
          receitas.map((receita) => (
            <div className="card" key={receita.id}>
              <h2>{receita.nome || receita.titulo}</h2>
              <h3>Ilustração:</h3>
              <img src={receita.img || receita.imagem} alt={receita.nome || receita.titulo} />
              <button onClick={() => setModalReceita(receita)}>Ver Receita</button>
            </div>
          ))
        )}
      </main>

      <footer>
        <p>Receitas do Fessor &copy; 2025</p>
      </footer>

      <Modal receita={modalReceita} onClose={() => setModalReceita(null)} />
    </>
  );
}

export default App;
