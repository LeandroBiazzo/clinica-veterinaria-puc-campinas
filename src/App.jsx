import { useState, useEffect } from 'react'
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Brain,
  Users
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts'
import './App.css'

// Componentes UI simples e funcionais
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md border ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
)

const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
)

const Button = ({ children, onClick, type = "button", disabled = false, className = "" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      disabled 
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105'
    } ${className}`}
  >
    {children}
  </button>
)

const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
)

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  
  // Estado para métricas dinâmicas com valores padrão seguros
  const [metricas, setMetricas] = useState({
    total_produtos: { valor: 0, label: 'Produtos Cadastrados' },
    total_itens_estoque: { valor: 0, label: 'Total de Itens' },
    entradas_mes: { valor: 0, label: 'Entradas do Mês', variacao: 0 },
    produtos_estoque_baixo: { valor: 0, label: 'Estoque Baixo', status: 'normal' },
    produtos_validade_proxima: { valor: 0, label: 'Validade Próxima', status: 'normal' },
    saidas_mes: { valor: 0, label: 'Saídas do Mês', variacao: 0 },
    pedidos_pendentes: { valor: 0, label: 'Pedidos Pendentes', status: 'normal' }
  })

  // Função para obter valor seguro das métricas
  const obterValorSeguro = (metrica) => {
    try {
      return metrica && typeof metrica === 'object' && metrica.valor !== undefined ? metrica.valor : 0
    } catch (error) {
      console.error('Erro ao acessar métrica:', error)
      return 0
    }
  }

  // Função para atualizar métricas com proteção contra erros
  const atualizarMetricas = async () => {
    try {
      console.log('Atualizando métricas...')
      const response = await fetch('https://mzhyi8c1dev6.manus.space/api/dashboard/metricas')
      if (response.ok) {
        const data = await response.json()
        
        // Garantir que todas as métricas tenham a estrutura correta
        const metricasSeguras = {
          total_produtos: data.total_produtos || { valor: 0, label: 'Produtos Cadastrados' },
          total_itens_estoque: data.total_itens_estoque || { valor: 0, label: 'Total de Itens' },
          entradas_mes: data.entradas_mes || { valor: 0, label: 'Entradas do Mês', variacao: 0 },
          produtos_estoque_baixo: data.produtos_estoque_baixo || { valor: 0, label: 'Estoque Baixo', status: 'normal' },
          produtos_validade_proxima: data.produtos_validade_proxima || { valor: 0, label: 'Validade Próxima', status: 'normal' },
          saidas_mes: data.saidas_mes || { valor: 0, label: 'Saídas do Mês', variacao: 0 },
          pedidos_pendentes: data.pedidos_pendentes || { valor: 0, label: 'Pedidos Pendentes', status: 'normal' }
        }
        
        setMetricas(metricasSeguras)
        console.log('Métricas atualizadas com segurança:', metricasSeguras)
      } else {
        console.warn('Resposta não OK do servidor, mantendo métricas padrão')
      }
    } catch (error) {
      console.error('Erro ao atualizar métricas (mantendo valores padrão):', error)
      // Não fazer nada - manter valores padrão
    }
  }

  // Disponibilizar função globalmente
  useEffect(() => {
    window.atualizarMetricas = atualizarMetricas
    atualizarMetricas() // Carregar métricas iniciais
  }, [])

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', color: 'border-green-500' },
    { id: 'entradas', label: 'Entradas', color: 'border-blue-500' },
    { id: 'saidas', label: 'Saídas', color: 'border-orange-500' },
    { id: 'produtos', label: 'Produtos', color: 'border-purple-500' },
    { id: 'fornecedores', label: 'Fornecedores', color: 'border-teal-500' },
    { id: 'importacao', label: 'Importação', color: 'border-indigo-500' },
    { id: 'relatorios', label: 'Relatórios', color: 'border-pink-500' }
  ]

  // Componente para entrada de estoque
  const EntradaEstoque = () => {
    console.log('Renderizando EntradaEstoque')
    
    const [entrada, setEntrada] = useState({
      produto_id: '',
      fornecedor_id: '',
      quantidade: '',
      lote: '',
      validade: '',
      numero_nf: ''
    })
    const [produtos, setProdutos] = useState([])
    const [fornecedores, setFornecedores] = useState([])
    const [novoFornecedor, setNovoFornecedor] = useState({ nome: '', contato: '', email: '' })
    const [mostrarFormFornecedor, setMostrarFormFornecedor] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [carregado, setCarregado] = useState(false)

    useEffect(() => {
      console.log('Carregando dados para EntradaEstoque')
      const carregarDados = async () => {
        try {
          const [produtosRes, fornecedoresRes] = await Promise.all([
            fetch('https://mzhyi8c1dev6.manus.space/api/produtos').catch(() => ({ ok: false })),
            fetch('https://mzhyi8c1dev6.manus.space/api/fornecedores').catch(() => ({ ok: false }))
          ])
          
          if (produtosRes.ok) {
            const produtosData = await produtosRes.json()
            const produtosList = produtosData.data || produtosData || []
            // Ordenar alfabeticamente
            produtosList.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
            setProdutos(produtosList)
            console.log('Produtos carregados:', produtosData)
          }
          
          if (fornecedoresRes.ok) {
            const fornecedoresData = await fornecedoresRes.json()
            const fornecedoresList = fornecedoresData.data || fornecedoresData || []
            // Ordenar alfabeticamente
            fornecedoresList.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
            setFornecedores(fornecedoresList)
            console.log('Fornecedores carregados:', fornecedoresData)
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error)
        } finally {
          setCarregado(true)
        }
      }
      
      carregarDados()
    }, [])

    const handleSubmitFornecedor = async (e) => {
      e.preventDefault()
      console.log('Cadastrando fornecedor:', novoFornecedor)
      
      try {
        const response = await fetch('https://mzhyi8c1dev6.manus.space/api/fornecedores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novoFornecedor)
        })

        if (response.ok) {
          const novoForn = await response.json()
          const novosFornecedores = [...fornecedores, novoForn].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
          setFornecedores(novosFornecedores)
          setNovoFornecedor({ nome: '', contato: '', email: '' })
          setMostrarFormFornecedor(false)
          alert('Fornecedor cadastrado com sucesso!')
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
          alert('Erro ao cadastrar fornecedor: ' + (errorData.message || 'Erro desconhecido'))
        }
      } catch (error) {
        console.error('Erro ao cadastrar fornecedor:', error)
        alert('Erro na conexão')
      }
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      
      // Validar se produto foi selecionado
      if (!entrada.produto_id) {
        alert('Por favor, selecione um produto cadastrado!')
        return
      }

      console.log('Registrando entrada:', entrada)
      setSalvando(true)

      try {
        const response = await fetch('https://mzhyi8c1dev6.manus.space/api/estoque/entradas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entrada)
        })

        if (response.ok) {
          alert('Entrada registrada com sucesso!')
          setEntrada({
            produto_id: '',
            fornecedor_id: '',
            quantidade: '',
            lote: '',
            validade: '',
            numero_nf: ''
          })
          // Atualizar métricas de forma segura e forçada
          setTimeout(() => {
            if (window.atualizarMetricas) {
              window.atualizarMetricas()
            }
          }, 2000) // Aguardar 2 segundos para o backend processar
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
          console.error('Erro na resposta:', errorData)
          alert('Erro ao registrar entrada: ' + (errorData.message || 'Erro desconhecido'))
        }
      } catch (error) {
        console.error('Erro na requisição:', error)
        alert('Erro na conexão')
      } finally {
        setSalvando(false)
      }
    }

    if (!carregado) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Carregando...</span>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <Card className="bg-white border-2 border-blue-500 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <TrendingUp className="h-6 w-6" />
              <span>Entrada de Estoque</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Produto *</label>
                  <select
                    value={entrada.produto_id}
                    onChange={(e) => setEntrada({...entrada, produto_id: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  >
                    <option value="">Selecione um produto cadastrado</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome || 'Produto sem nome'}
                      </option>
                    ))}
                  </select>
                  {produtos.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Nenhum produto cadastrado. Cadastre produtos na aba "Produtos".
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Fornecedor *</label>
                  <div className="flex space-x-2">
                    <select
                      value={entrada.fornecedor_id}
                      onChange={(e) => setEntrada({...entrada, fornecedor_id: e.target.value})}
                      className="flex-1 p-3 border-2 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      required
                    >
                      <option value="">Selecione um fornecedor</option>
                      {fornecedores.map(fornecedor => (
                        <option key={fornecedor.id} value={fornecedor.id}>
                          {fornecedor.nome || 'Fornecedor sem nome'}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      onClick={() => setMostrarFormFornecedor(!mostrarFormFornecedor)}
                      className="bg-green-600 hover:bg-green-700 px-4"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {mostrarFormFornecedor && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-700 text-lg">Cadastrar Novo Fornecedor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitFornecedor} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          placeholder="Nome do fornecedor *"
                          value={novoFornecedor.nome}
                          onChange={(e) => setNovoFornecedor({...novoFornecedor, nome: e.target.value})}
                          className="p-2 border rounded-lg"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Contato/Telefone"
                          value={novoFornecedor.contato}
                          onChange={(e) => setNovoFornecedor({...novoFornecedor, contato: e.target.value})}
                          className="p-2 border rounded-lg"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={novoFornecedor.email}
                          onChange={(e) => setNovoFornecedor({...novoFornecedor, email: e.target.value})}
                          className="p-2 border rounded-lg"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                          Cadastrar Fornecedor
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => setMostrarFormFornecedor(false)}
                          className="bg-gray-500 hover:bg-gray-600"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Quantidade *</label>
                  <input
                    type="number"
                    value={entrada.quantidade}
                    onChange={(e) => setEntrada({...entrada, quantidade: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Lote *</label>
                  <input
                    type="text"
                    value={entrada.lote}
                    onChange={(e) => setEntrada({...entrada, lote: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Validade *</label>
                  <input
                    type="date"
                    value={entrada.validade}
                    onChange={(e) => setEntrada({...entrada, validade: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Número da NF *</label>
                <input
                  type="text"
                  value={entrada.numero_nf}
                  onChange={(e) => setEntrada({...entrada, numero_nf: e.target.value})}
                  className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={salvando} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg transition-all transform hover:scale-105"
              >
                {salvando ? 'Salvando...' : 'Registrar Entrada'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Componente para saída de estoque - CORRIGIDO
  const SaidaEstoque = () => {
    console.log('Renderizando SaidaEstoque')
    
    const [saida, setSaida] = useState({
      produto_id: '',
      quantidade: '',
      local_destino_id: '', // CORRIGIDO: usar local_destino_id
      observacoes: ''
    })
    const [produtos, setProdutos] = useState([])
    const [locais, setLocais] = useState([])
    const [salvando, setSalvando] = useState(false)
    const [carregado, setCarregado] = useState(false)

    // Locais predefinidos com IDs
    const locaisPredefinidos = [
      { id: 1, nome: 'Farmácia' },
      { id: 2, nome: 'Lab. Clínico' },
      { id: 3, nome: 'Centro Cirúrgico' },
      { id: 4, nome: 'Lab. Reprodução' },
      { id: 5, nome: 'Clínica Grandes' },
      { id: 6, nome: 'Aula Externa' }
    ]

    useEffect(() => {
      console.log('Carregando produtos para SaidaEstoque')
      const carregarProdutos = async () => {
        try {
          const response = await fetch('https://mzhyi8c1dev6.manus.space/api/produtos').catch(() => ({ ok: false }))
          if (response.ok) {
            const data = await response.json()
            const produtosList = data.data || data || []
            // Ordenar alfabeticamente
            produtosList.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
            setProdutos(produtosList)
            console.log('Produtos carregados para saída:', data)
          }
          
          // Definir locais predefinidos
          setLocais(locaisPredefinidos)
        } catch (error) {
          console.error('Erro ao carregar produtos:', error)
        } finally {
          setCarregado(true)
        }
      }
      
      carregarProdutos()
    }, [])

    const handleSubmit = async (e) => {
      e.preventDefault()
      
      // Validar se produto foi selecionado
      if (!saida.produto_id) {
        alert('Por favor, selecione um produto cadastrado!')
        return
      }

      // Validar se local foi selecionado
      if (!saida.local_destino_id) {
        alert('Por favor, selecione um local de destino!')
        return
      }

      console.log('Registrando saída:', saida)
      setSalvando(true)

      try {
        // Preparar dados para envio
        const dadosSaida = {
          produto_id: parseInt(saida.produto_id),
          quantidade: parseInt(saida.quantidade),
          local_destino_id: parseInt(saida.local_destino_id),
          observacoes: saida.observacoes || ''
        }

        console.log('Dados da saída preparados:', dadosSaida)

        const response = await fetch('https://mzhyi8c1dev6.manus.space/api/estoque/saidas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dadosSaida)
        })

        if (response.ok) {
          alert('Saída registrada com sucesso!')
          setSaida({
            produto_id: '',
            quantidade: '',
            local_destino_id: '',
            observacoes: ''
          })
          // Atualizar métricas de forma segura e forçada
          setTimeout(() => {
            if (window.atualizarMetricas) {
              window.atualizarMetricas()
            }
          }, 2000) // Aguardar 2 segundos para o backend processar
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
          console.error('Erro na resposta:', errorData)
          alert('Erro ao registrar saída: ' + (errorData.message || 'Erro desconhecido'))
        }
      } catch (error) {
        console.error('Erro na requisição:', error)
        alert('Erro na conexão')
      } finally {
        setSalvando(false)
      }
    }

    if (!carregado) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2">Carregando...</span>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <Card className="bg-white border-2 border-orange-500 shadow-lg">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <TrendingDown className="h-6 w-6" />
              <span>Saída de Estoque</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Produto *</label>
                <select
                  value={saida.produto_id}
                  onChange={(e) => setSaida({...saida, produto_id: e.target.value})}
                  className="w-full p-3 border-2 rounded-lg bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  required
                >
                  <option value="">Selecione um produto cadastrado</option>
                  {produtos.map(produto => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome || 'Produto sem nome'}
                    </option>
                  ))}
                </select>
                {produtos.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Nenhum produto cadastrado. Cadastre produtos na aba "Produtos".
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Quantidade *</label>
                  <input
                    type="number"
                    value={saida.quantidade}
                    onChange={(e) => setSaida({...saida, quantidade: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Local de Destino *</label>
                  <select
                    value={saida.local_destino_id}
                    onChange={(e) => setSaida({...saida, local_destino_id: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    required
                  >
                    <option value="">Selecione o destino</option>
                    {locais.map(local => (
                      <option key={local.id} value={local.id}>
                        {local.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Observações</label>
                <textarea
                  value={saida.observacoes}
                  onChange={(e) => setSaida({...saida, observacoes: e.target.value})}
                  className="w-full p-3 border-2 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  rows="3"
                  placeholder="Observações sobre a saída (opcional)"
                />
              </div>

              <Button 
                type="submit" 
                disabled={salvando} 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold rounded-lg transition-all transform hover:scale-105"
              >
                {salvando ? 'Salvando...' : 'Registrar Saída'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Componente para cadastro de produtos - CORRIGIDO
  const CadastrarProduto = () => {
    const [produto, setProduto] = useState({
      nome: '',
      categoria: '',
      estoque_minimo: 10,
      preco_unitario: '',
      descricao: ''
    })
    const [produtos, setProdutos] = useState([])
    const [salvando, setSalvando] = useState(false)
    const [carregado, setCarregado] = useState(false)
    const [editando, setEditando] = useState(null)

    useEffect(() => {
      const carregarProdutos = async () => {
        try {
          const response = await fetch('https://mzhyi8c1dev6.manus.space/api/produtos').catch(() => ({ ok: false }))
          if (response.ok) {
            const data = await response.json()
            const produtosList = data.data || data || []
            // Ordenar alfabeticamente
            produtosList.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
            setProdutos(produtosList)
          }
        } catch (error) {
          console.error('Erro ao carregar produtos:', error)
        } finally {
          setCarregado(true)
        }
      }
      
      carregarProdutos()
    }, [])

    const handleSubmit = async (e) => {
      e.preventDefault()
      setSalvando(true)

      try {
        const url = editando 
          ? `https://mzhyi8c1dev6.manus.space/api/produtos/${editando}`
          : 'https://mzhyi8c1dev6.manus.space/api/produtos'
        
        // Preparar dados para envio
        const dadosProduto = {
          nome: produto.nome,
          categoria: produto.categoria,
          estoque_minimo: parseInt(produto.estoque_minimo) || 10,
          preco_unitario: produto.preco_unitario ? parseFloat(produto.preco_unitario) : null,
          descricao: produto.descricao || ''
        }

        console.log('Enviando produto:', dadosProduto)
        
        const response = await fetch(url, {
          method: editando ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dadosProduto)
        })

        if (response.ok) {
          const produtoRetornado = await response.json()
          
          if (editando) {
            // Atualizar produto na lista
            setProdutos(produtos.map(p => p.id === editando ? produtoRetornado : p).sort((a, b) => (a.nome || '').localeCompare(b.nome || '')))
            setEditando(null)
            alert('Produto atualizado com sucesso!')
          } else {
            // Adicionar novo produto à lista
            setProdutos([...produtos, produtoRetornado].sort((a, b) => (a.nome || '').localeCompare(b.nome || '')))
            alert('Produto cadastrado com sucesso!')
          }
          
          // Limpar formulário
          setProduto({
            nome: '',
            categoria: '',
            estoque_minimo: 10,
            preco_unitario: '',
            descricao: ''
          })

          // Atualizar métricas
          setTimeout(() => {
            if (window.atualizarMetricas) {
              window.atualizarMetricas()
            }
          }, 1000)
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
          console.error('Erro na resposta:', errorData)
          alert('Erro ao salvar produto: ' + (errorData.message || 'Erro desconhecido'))
        }
      } catch (error) {
        console.error('Erro:', error)
        alert('Erro na conexão')
      } finally {
        setSalvando(false)
      }
    }

    const handleEditar = (produtoParaEditar) => {
      setProduto({
        nome: produtoParaEditar.nome || '',
        categoria: produtoParaEditar.categoria || '',
        estoque_minimo: produtoParaEditar.estoque_minimo || 10,
        preco_unitario: produtoParaEditar.preco_unitario || '',
        descricao: produtoParaEditar.descricao || ''
      })
      setEditando(produtoParaEditar.id)
    }

    const handleExcluir = async (id) => {
      if (!confirm('Tem certeza que deseja excluir este produto?')) return

      try {
        const response = await fetch(`https://mzhyi8c1dev6.manus.space/api/produtos/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setProdutos(produtos.filter(p => p.id !== id))
          alert('Produto excluído com sucesso!')
          
          // Atualizar métricas
          setTimeout(() => {
            if (window.atualizarMetricas) {
              window.atualizarMetricas()
            }
          }, 1000)
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
          alert('Erro ao excluir produto: ' + (errorData.message || 'Erro desconhecido'))
        }
      } catch (error) {
        console.error('Erro:', error)
        alert('Erro na conexão')
      }
    }

    const cancelarEdicao = () => {
      setEditando(null)
      setProduto({
        nome: '',
        categoria: '',
        estoque_minimo: 10,
        preco_unitario: '',
        descricao: ''
      })
    }

    return (
      <div className="space-y-6">
        <Card className="bg-white border-2 border-purple-500 shadow-lg">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <Package className="h-6 w-6" />
              <span>{editando ? 'Editar Produto' : 'Cadastrar Produto'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nome do Produto *</label>
                <input
                  type="text"
                  value={produto.nome}
                  onChange={(e) => setProduto({...produto, nome: e.target.value})}
                  className="w-full p-3 border-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Categoria *</label>
                  <select
                    value={produto.categoria}
                    onChange={(e) => setProduto({...produto, categoria: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Medicamentos">Medicamentos</option>
                    <option value="Materiais">Materiais</option>
                    <option value="Equipamentos">Equipamentos</option>
                    <option value="Descartáveis">Descartáveis</option>
                    <option value="Antissépticos">Antissépticos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Estoque Mínimo *</label>
                  <input
                    type="number"
                    value={produto.estoque_minimo}
                    onChange={(e) => setProduto({...produto, estoque_minimo: parseInt(e.target.value) || 0})}
                    className="w-full p-3 border-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Preço Unitário</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produto.preco_unitario}
                    onChange={(e) => setProduto({...produto, preco_unitario: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Descrição</label>
                <textarea
                  value={produto.descricao}
                  onChange={(e) => setProduto({...produto, descricao: e.target.value})}
                  className="w-full p-3 border-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  rows="3"
                  placeholder="Descrição do produto (opcional)"
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={salvando} 
                  className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 font-semibold rounded-lg transition-all transform hover:scale-105"
                >
                  {salvando ? 'Salvando...' : (editando ? 'Atualizar Produto' : 'Cadastrar Produto')}
                </Button>
                
                {editando && (
                  <Button 
                    type="button" 
                    onClick={cancelarEdicao}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 font-semibold rounded-lg"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Produtos */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-700">
              <Package className="h-5 w-5" />
              <span>Produtos Cadastrados ({produtos.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!carregado ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-2">Carregando produtos...</span>
              </div>
            ) : produtos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum produto cadastrado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">Categoria</th>
                      <th className="px-4 py-2 text-left">Estoque Mín.</th>
                      <th className="px-4 py-2 text-left">Preço</th>
                      <th className="px-4 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map(prod => (
                      <tr key={prod.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{prod.nome || 'Sem nome'}</td>
                        <td className="px-4 py-2">
                          <Badge className="bg-purple-100 text-purple-800">
                            {prod.categoria || 'Sem categoria'}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">{prod.estoque_minimo || 0}</td>
                        <td className="px-4 py-2">
                          {prod.preco_unitario ? `R$ ${parseFloat(prod.preco_unitario).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEditar(prod)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleExcluir(prod.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Componente para gerenciar fornecedores - NOVO
  const GerenciarFornecedores = () => {
    const [fornecedor, setFornecedor] = useState({
      nome: '',
      contato: '',
      email: ''
    })
    const [fornecedores, setFornecedores] = useState([])
    const [salvando, setSalvando] = useState(false)
    const [carregado, setCarregado] = useState(false)
    const [editando, setEditando] = useState(null)

    useEffect(() => {
      const carregarFornecedores = async () => {
        try {
          const response = await fetch('https://mzhyi8c1dev6.manus.space/api/fornecedores').catch(() => ({ ok: false }))
          if (response.ok) {
            const data = await response.json()
            const fornecedoresList = data.data || data || []
            // Ordenar alfabeticamente
            fornecedoresList.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
            setFornecedores(fornecedoresList)
          }
        } catch (error) {
          console.error('Erro ao carregar fornecedores:', error)
        } finally {
          setCarregado(true)
        }
      }
      
      carregarFornecedores()
    }, [])

    const handleSubmit = async (e) => {
      e.preventDefault()
      setSalvando(true)

      try {
        const url = editando 
          ? `https://mzhyi8c1dev6.manus.space/api/fornecedores/${editando}`
          : 'https://mzhyi8c1dev6.manus.space/api/fornecedores'
        
        const response = await fetch(url, {
          method: editando ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fornecedor)
        })

        if (response.ok) {
          const fornecedorRetornado = await response.json()
          
          if (editando) {
            setFornecedores(fornecedores.map(f => f.id === editando ? fornecedorRetornado : f).sort((a, b) => (a.nome || '').localeCompare(b.nome || '')))
            setEditando(null)
            alert('Fornecedor atualizado com sucesso!')
          } else {
            setFornecedores([...fornecedores, fornecedorRetornado].sort((a, b) => (a.nome || '').localeCompare(b.nome || '')))
            alert('Fornecedor cadastrado com sucesso!')
          }
          
          setFornecedor({
            nome: '',
            contato: '',
            email: ''
          })
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
          alert('Erro ao salvar fornecedor: ' + (errorData.message || 'Erro desconhecido'))
        }
      } catch (error) {
        console.error('Erro:', error)
        alert('Erro na conexão')
      } finally {
        setSalvando(false)
      }
    }

    const handleEditar = (fornecedorParaEditar) => {
      setFornecedor({
        nome: fornecedorParaEditar.nome || '',
        contato: fornecedorParaEditar.contato || '',
        email: fornecedorParaEditar.email || ''
      })
      setEditando(fornecedorParaEditar.id)
    }

    const handleExcluir = async (id) => {
      if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return

      try {
        const response = await fetch(`https://mzhyi8c1dev6.manus.space/api/fornecedores/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setFornecedores(fornecedores.filter(f => f.id !== id))
          alert('Fornecedor excluído com sucesso!')
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
          alert('Erro ao excluir fornecedor: ' + (errorData.message || 'Erro desconhecido'))
        }
      } catch (error) {
        console.error('Erro:', error)
        alert('Erro na conexão')
      }
    }

    const cancelarEdicao = () => {
      setEditando(null)
      setFornecedor({
        nome: '',
        contato: '',
        email: ''
      })
    }

    return (
      <div className="space-y-6">
        <Card className="bg-white border-2 border-teal-500 shadow-lg">
          <CardHeader className="bg-teal-50">
            <CardTitle className="flex items-center space-x-2 text-teal-700">
              <Users className="h-6 w-6" />
              <span>{editando ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nome do Fornecedor *</label>
                <input
                  type="text"
                  value={fornecedor.nome}
                  onChange={(e) => setFornecedor({...fornecedor, nome: e.target.value})}
                  className="w-full p-3 border-2 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Contato/Telefone</label>
                  <input
                    type="text"
                    value={fornecedor.contato}
                    onChange={(e) => setFornecedor({...fornecedor, contato: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                    placeholder="(19) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                  <input
                    type="email"
                    value={fornecedor.email}
                    onChange={(e) => setFornecedor({...fornecedor, email: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                    placeholder="contato@fornecedor.com"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={salvando} 
                  className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 font-semibold rounded-lg transition-all transform hover:scale-105"
                >
                  {salvando ? 'Salvando...' : (editando ? 'Atualizar Fornecedor' : 'Cadastrar Fornecedor')}
                </Button>
                
                {editando && (
                  <Button 
                    type="button" 
                    onClick={cancelarEdicao}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 font-semibold rounded-lg"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Fornecedores */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-700">
              <Users className="h-5 w-5" />
              <span>Fornecedores Cadastrados ({fornecedores.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!carregado ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-2">Carregando fornecedores...</span>
              </div>
            ) : fornecedores.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum fornecedor cadastrado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">Contato</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fornecedores.map(forn => (
                      <tr key={forn.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{forn.nome || 'Sem nome'}</td>
                        <td className="px-4 py-2">{forn.contato || '-'}</td>
                        <td className="px-4 py-2">{forn.email || '-'}</td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEditar(forn)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleExcluir(forn.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Componente de Análise Preditiva com IA
  const AnalisePreditiva = () => {
    const [analise, setAnalise] = useState(null)
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState(null)

    const gerarAnalise = async () => {
      setCarregando(true)
      setErro(null)
      
      try {
        const response = await fetch('https://mzhyi8c1dev6.manus.space/api/predicao/analise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          const data = await response.json()
          setAnalise(data)
        } else {
          setErro('Erro ao gerar análise preditiva')
        }
      } catch (error) {
        console.error('Erro:', error)
        setErro('Erro na conexão com o servidor')
      } finally {
        setCarregando(false)
      }
    }

    return (
      <div className="space-y-6">
        <Card className="bg-white border-2 border-pink-500 shadow-lg">
          <CardHeader className="bg-pink-50">
            <CardTitle className="flex items-center space-x-2 text-pink-700">
              <Brain className="h-6 w-6" />
              <span>Análise Preditiva com IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Gere sugestões inteligentes de compra baseadas em análise de dados e IA
              </p>
              <Button 
                onClick={gerarAnalise}
                disabled={carregando}
                className="bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 font-semibold rounded-lg"
              >
                {carregando ? 'Analisando...' : 'Gerar Análise Preditiva'}
              </Button>
            </div>

            {erro && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{erro}</p>
              </div>
            )}

            {analise && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Sugestões de Compra para o Próximo Mês</h3>
                
                {analise.sugestoes && analise.sugestoes.length > 0 ? (
                  <div className="space-y-3">
                    {analise.sugestoes.map((sugestao, index) => (
                      <Card key={index} className="border-l-4 border-l-pink-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{sugestao.produto || 'Produto'}</h4>
                              <p className="text-sm text-gray-600 mt-1">{sugestao.justificativa || 'Sem justificativa'}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={`${
                                sugestao.prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
                                sugestao.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {sugestao.prioridade || 'Normal'}
                              </Badge>
                              <p className="text-lg font-bold text-gray-800 mt-1">
                                {sugestao.quantidade || 0} unidades
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhuma sugestão disponível no momento.</p>
                )}

                {analise.resumo && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Resumo da Análise</h4>
                      <p className="text-blue-700">{analise.resumo}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dados para gráficos
  const dadosTendencia = [
    { mes: 'Ago/2025', entradas: 15, saidas: 12 },
    { mes: 'Set/2025', entradas: 28, saidas: 25 },
    { mes: 'Out/2025', entradas: 22, saidas: 18 },
    { mes: 'Nov/2025', entradas: 35, saidas: 30 },
    { mes: 'Dez/2025', entradas: 18, saidas: 22 }
  ]

  const dadosDistribuicao = [
    { local: 'Farmácia', valor: 35, cor: '#3B82F6' },
    { local: 'Lab. Clínico', valor: 25, cor: '#10B981' },
    { local: 'Centro Cirúrgico', valor: 20, cor: '#F59E0B' },
    { local: 'Lab. Reprodução', valor: 20, cor: '#EF4444' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Clínica Veterinária PUC Campinas
          </h1>
          <p className="text-gray-600 mt-1">Sistema de Gestão de Estoque com IA Preditiva</p>
        </div>
      </header>

      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${tab.color} text-blue-600 bg-blue-50`
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-green-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                      <p className="text-3xl font-bold text-green-600">{obterValorSeguro(metricas.total_produtos)}</p>
                    </div>
                    <Package className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Itens em Estoque</p>
                      <p className="text-3xl font-bold text-blue-600">{obterValorSeguro(metricas.total_itens_estoque)}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Entradas do Mês</p>
                      <p className="text-3xl font-bold text-orange-600">{obterValorSeguro(metricas.entradas_mes)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                      <p className="text-3xl font-bold text-red-600">{obterValorSeguro(metricas.produtos_estoque_baixo)}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas Secundárias */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Saídas do Mês</p>
                      <p className="text-2xl font-bold text-purple-600">{obterValorSeguro(metricas.saidas_mes)}</p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Validade Próxima</p>
                      <p className="text-2xl font-bold text-yellow-600">{obterValorSeguro(metricas.produtos_validade_proxima)}</p>
                    </div>
                    <Calendar className="h-6 w-6 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pedidos Pendentes</p>
                      <p className="text-2xl font-bold text-indigo-600">{obterValorSeguro(metricas.pedidos_pendentes)}</p>
                    </div>
                    <ShoppingCart className="h-6 w-6 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-700">
                    <BarChart3 className="h-5 w-5" />
                    <span>Tendência de Movimentações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dadosTendencia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="entradas" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="saidas" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-700">
                    <PieChart className="h-5 w-5" />
                    <span>Distribuição por Locais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={dadosDistribuicao}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valor"
                        label={({ local, valor }) => `${local}: ${valor}%`}
                      >
                        {dadosDistribuicao.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {dadosDistribuicao.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.cor }}
                        ></div>
                        <span className="text-sm text-gray-600">{item.local}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'entradas' && <EntradaEstoque />}
        {activeTab === 'saidas' && <SaidaEstoque />}
        {activeTab === 'produtos' && <CadastrarProduto />}
        {activeTab === 'fornecedores' && <GerenciarFornecedores />}
        {activeTab === 'relatorios' && <AnalisePreditiva />}
        
        {activeTab === 'importacao' && (
          <Card className="bg-white border-2 border-indigo-500 shadow-lg">
            <CardHeader className="bg-indigo-50">
              <CardTitle className="flex items-center space-x-2 text-indigo-700">
                <Package className="h-6 w-6" />
                <span>Importação de Dados</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Funcionalidade de importação em desenvolvimento
                </p>
                <p className="text-sm text-gray-500">
                  Em breve você poderá importar dados via CSV/Excel
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default App
