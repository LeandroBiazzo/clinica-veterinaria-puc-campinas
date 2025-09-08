import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Brain
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  
  // Estado para métricas dinâmicas
  const [metricas, setMetricas] = useState({
    total_produtos: { valor: 0, label: 'Produtos Cadastrados' },
    total_itens_estoque: { valor: 0, label: 'Total de Itens' },
    entradas_mes: { valor: 0, label: 'Entradas do Mês', variacao: 0 },
    produtos_estoque_baixo: { valor: 0, label: 'Estoque Baixo', status: 'normal' },
    produtos_validade_proxima: { valor: 0, label: 'Validade Próxima', status: 'normal' },
    saidas_mes: { valor: 0, label: 'Saídas do Mês', variacao: 0 },
    pedidos_pendentes: { valor: 0, label: 'Pedidos Pendentes', status: 'normal' }
  })

  // Função para atualizar métricas
  const atualizarMetricas = async () => {
    try {
      console.log('Atualizando métricas...')
      const response = await fetch('https://mzhyi8c1dev6.manus.space/api/dashboard/metricas')
      if (response.ok) {
        const data = await response.json()
        setMetricas(data)
        console.log('Métricas atualizadas:', data)
      }
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error)
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
    { id: 'importacao', label: 'Importação', color: 'border-indigo-500' },
    { id: 'relatorios', label: 'Relatórios', color: 'border-pink-500' }
  ]

  // Componente para entrada de estoque - SIMPLIFICADO E FUNCIONAL
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
            fetch('https://mzhyi8c1dev6.manus.space/api/produtos'),
            fetch('https://mzhyi8c1dev6.manus.space/api/fornecedores')
          ])
          
          if (produtosRes.ok) {
            const produtosData = await produtosRes.json()
            setProdutos(produtosData.data || produtosData || [])
            console.log('Produtos carregados:', produtosData)
          }
          
          if (fornecedoresRes.ok) {
            const fornecedoresData = await fornecedoresRes.json()
            setFornecedores(fornecedoresData.data || fornecedoresData || [])
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
          setFornecedores([...fornecedores, novoForn])
          setNovoFornecedor({ nome: '', contato: '', email: '' })
          setMostrarFormFornecedor(false)
          alert('Fornecedor cadastrado com sucesso!')
        }
      } catch (error) {
        console.error('Erro ao cadastrar fornecedor:', error)
        alert('Erro ao cadastrar fornecedor')
      }
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
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
          if (window.atualizarMetricas) {
            window.atualizarMetricas()
          }
        } else {
          const errorData = await response.json()
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
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Produto</label>
                  <select
                    value={entrada.produto_id}
                    onChange={(e) => setEntrada({...entrada, produto_id: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Fornecedor</label>
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
                          {fornecedor.nome}
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
                          placeholder="Nome do fornecedor"
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
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Quantidade</label>
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
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Lote</label>
                  <input
                    type="text"
                    value={entrada.lote}
                    onChange={(e) => setEntrada({...entrada, lote: e.target.value})}
                    className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Validade</label>
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
                <label className="block text-sm font-semibold mb-2 text-gray-700">Número da NF</label>
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

  // Componente para saída de estoque - SIMPLIFICADO E FUNCIONAL
  const SaidaEstoque = () => {
    console.log('Renderizando SaidaEstoque')
    
    const [saida, setSaida] = useState({
      produto_id: '',
      quantidade: '',
      local_destino: '',
      observacoes: ''
    })
    const [produtos, setProdutos] = useState([])
    const [salvando, setSalvando] = useState(false)
    const [carregado, setCarregado] = useState(false)

    useEffect(() => {
      console.log('Carregando produtos para SaidaEstoque')
      const carregarProdutos = async () => {
        try {
          const response = await fetch('https://mzhyi8c1dev6.manus.space/api/produtos')
          if (response.ok) {
            const data = await response.json()
            setProdutos(data.data || data || [])
            console.log('Produtos carregados para saída:', data)
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
      console.log('Registrando saída:', saida)
      setSalvando(true)

      try {
        const response = await fetch('https://mzhyi8c1dev6.manus.space/api/estoque/saidas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saida)
        })

        if (response.ok) {
          alert('Saída registrada com sucesso!')
          setSaida({
            produto_id: '',
            quantidade: '',
            local_destino: '',
            observacoes: ''
          })
          if (window.atualizarMetricas) {
            window.atualizarMetricas()
          }
        } else {
          const errorData = await response.json()
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
              <label className="block text-sm font-semibold mb-2 text-gray-700">Produto</label>
              <select
                value={saida.produto_id}
                onChange={(e) => setSaida({...saida, produto_id: e.target.value})}
                className="w-full p-3 border-2 rounded-lg bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                required
              >
                <option value="">Selecione um produto</option>
                {produtos.map(produto => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} (Estoque: {produto.quantidade_atual || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Quantidade</label>
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
                <label className="block text-sm font-semibold mb-2 text-gray-700">Local de Destino</label>
                <select
                  value={saida.local_destino}
                  onChange={(e) => setSaida({...saida, local_destino: e.target.value})}
                  className="w-full p-3 border-2 rounded-lg bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  required
                >
                  <option value="">Selecione o destino</option>
                  <option value="Farmácia">Farmácia</option>
                  <option value="Lab. Clínico">Lab. Clínico</option>
                  <option value="Centro Cirúrgico">Centro Cirúrgico</option>
                  <option value="Lab. Reprodução">Lab. Reprodução</option>
                  <option value="Clínica Grandes">Clínica Grandes</option>
                  <option value="Aula Externa">Aula Externa</option>
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
    )
  }

  // Função para renderizar conteúdo da aba ativa
  const renderActiveTab = () => {
    console.log('Renderizando aba ativa:', activeTab)
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <h2 className="text-xl font-bold text-green-700 mb-2">✅ Sistema Funcionando!</h2>
              <p className="text-green-600">Todas as abas estão operacionais. Clique nas abas acima para navegar.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-2 border-green-500 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total de Produtos</CardTitle>
                  <Package className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas.total_produtos.valor}</div>
                  <div className="text-xs text-gray-600">{metricas.total_produtos.label}</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-blue-500 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Itens em Estoque</CardTitle>
                  <Activity className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas.total_itens_estoque.valor}</div>
                  <div className="text-xs text-gray-600">{metricas.total_itens_estoque.label}</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-orange-500 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Entradas do Mês</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas.entradas_mes.valor}</div>
                  <div className="text-xs text-gray-600">{metricas.entradas_mes.label}</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-red-500 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Estoque Baixo</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas.produtos_estoque_baixo.valor}</div>
                  <div className="text-xs text-gray-600">{metricas.produtos_estoque_baixo.label}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      
      case 'entradas':
        return <EntradaEstoque />
      
      case 'saidas':
        return <SaidaEstoque />
      
      case 'produtos':
        return (
          <div className="text-center p-8 bg-purple-50 rounded-lg border-2 border-purple-200">
            <Package className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-purple-700 mb-2">Gestão de Produtos</h2>
            <p className="text-purple-600">Funcionalidade em desenvolvimento...</p>
          </div>
        )
      
      case 'importacao':
        return (
          <div className="text-center p-8 bg-indigo-50 rounded-lg border-2 border-indigo-200">
            <ShoppingCart className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-indigo-700 mb-2">Importação de Dados</h2>
            <p className="text-indigo-600">Funcionalidade em desenvolvimento...</p>
          </div>
        )
      
      case 'relatorios':
        return (
          <div className="text-center p-8 bg-pink-50 rounded-lg border-2 border-pink-200">
            <Brain className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-pink-700 mb-2">Análise Preditiva com IA</h2>
            <p className="text-pink-600">Funcionalidade em desenvolvimento...</p>
          </div>
        )
      
      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-xl font-bold mb-2">Aba não encontrada</h2>
            <p>A aba "{activeTab}" não foi implementada ainda.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Clínica Veterinária PUC Campinas - v2.0</h1>
        </div>
      </header>

      <nav className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  console.log('Mudando para aba:', tab.id)
                  setActiveTab(tab.id)
                }}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? `${tab.color} text-blue-600 border-current bg-blue-50`
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {renderActiveTab()}
      </main>
    </div>
  )
}

export default App

