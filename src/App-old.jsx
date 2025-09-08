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
  ShoppingCart
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
      const response = await fetch('https://mzhyi8c1dev6.manus.space/api/dashboard/metricas')
      if (response.ok) {
        const data = await response.json()
        setMetricas(data)
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

  const movimentacoes = [
    { periodo: 'Jul/2025', entradas: 0, saidas: 0 },
    { periodo: 'Ago/2025', entradas: 0, saidas: 0 },
    { periodo: 'Set/2025', entradas: 0, saidas: 0 },
    { periodo: 'Out/2025', entradas: 0, saidas: 0 },
    { periodo: 'Nov/2025', entradas: 0, saidas: 0 },
    { periodo: 'Dez/2025', entradas: 0, saidas: 0 }
  ]

  const distribuicaoLocais = [
    { local: 'Farmácia', quantidade: 0, cor: '#3B82F6' },
    { local: 'Lab. Clínico', quantidade: 0, cor: '#10B981' },
    { local: 'Centro Cirúrgico', quantidade: 0, cor: '#F59E0B' },
    { local: 'Lab. Reprodução', quantidade: 0, cor: '#EF4444' },
    { local: 'Clínica Grandes', quantidade: 0, cor: '#8B5CF6' },
    { local: 'Aula Externa', quantidade: 0, cor: '#06B6D4' }
  ]

  const alertas = [
    {
      tipo: 'sistema_limpo',
      titulo: 'Sistema pronto para uso',
      descricao: 'Comece cadastrando produtos ou importando dados',
      prioridade: 'info'
    }
  ]

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', color: 'border-green-500' },
    { id: 'entradas', label: 'Entradas', color: 'border-blue-500' },
    { id: 'saidas', label: 'Saídas', color: 'border-orange-500' },
    { id: 'produtos', label: 'Produtos', color: 'border-purple-500' },
    { id: 'importacao', label: 'Importação', color: 'border-pink-500' },
    { id: 'relatorios', label: 'Relatórios', color: 'border-cyan-500' }
  ]

  const MetricCard = ({ title, value, label, variation, status, icon: Icon, color }) => (
    <Card className={`bg-card border-2 ${color} hover:shadow-lg transition-all duration-200`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{label}</span>
          {variation !== undefined && (
            <Badge variant={variation >= 0 ? "default" : "destructive"} className="text-xs">
              {variation >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(variation)}%
            </Badge>
          )}
          {status === 'alerta' && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Alerta
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']

  // Componente para cadastro de produtos
  const CadastrarProduto = () => {
    const [produto, setProduto] = useState({
      nome: '',
      categoria: '',
      unidade_medida: 'UN',
      estoque_minimo: 10
    })
    const [produtos, setProdutos] = useState([])
    const [salvando, setSalvando] = useState(false)
    const [carregando, setCarregando] = useState(true)
    const [editando, setEditando] = useState(null)

    useEffect(() => {
      carregarProdutos()
    }, [])

    const carregarProdutos = async () => {
      try {
        const response = await fetch('https://mzhyi8c1dev6.manus.space/api/produtos')
        if (response.ok) {
          const data = await response.json()
          setProdutos(data.data || data || [])
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
      } finally {
        setCarregando(false)
      }
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setSalvando(true)

      try {
        const url = editando 
          ? `https://mzhyi8c1dev6.manus.space/api/produtos/${editando.id}`
          : 'https://mzhyi8c1dev6.manus.space/api/produtos'
        
        const response = await fetch(url, {
          method: editando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(produto)
        })

        if (response.ok) {
          alert(editando ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!')
          setProduto({ nome: '', categoria: '', unidade_medida: 'UN', estoque_minimo: 10 })
          setEditando(null)
          carregarProdutos()
        } else {
          alert('Erro ao salvar produto')
        }
      } catch (error) {
        alert('Erro na conexão')
      } finally {
        setSalvando(false)
      }
    }

    const editarProduto = (prod) => {
      setProduto(prod)
      setEditando(prod)
    }

    const excluirProduto = async (id) => {
      if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
          const response = await fetch(`https://mzhyi8c1dev6.manus.space/api/produtos/${id}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            alert('Produto excluído com sucesso!')
            carregarProdutos()
          } else {
            alert('Erro ao excluir produto')
          }
        } catch (error) {
          alert('Erro na conexão')
        }
      }
    }

    const cancelarEdicao = () => {
      setProduto({ nome: '', categoria: '', unidade_medida: 'UN', estoque_minimo: 10 })
      setEditando(null)
    }

    return (
      <div className="space-y-4">
        <Card className="bg-card border-2 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>{editando ? 'Editar Produto' : 'Cadastrar Produto'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Produto</label>
                <input
                  type="text"
                  value={produto.nome}
                  onChange={(e) => setProduto({...produto, nome: e.target.value})}
                  className="w-full p-2 border rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <select
                  value={produto.categoria}
                  onChange={(e) => setProduto({...produto, categoria: e.target.value})}
                  className="w-full p-2 border rounded-md bg-background"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Unidade</label>
                  <select
                    value={produto.unidade_medida}
                    onChange={(e) => setProduto({...produto, unidade_medida: e.target.value})}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="UN">Unidade</option>
                    <option value="CX">Caixa</option>
                    <option value="ML">Mililitro</option>
                    <option value="MG">Miligrama</option>
                    <option value="KG">Quilograma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={produto.estoque_minimo}
                    onChange={(e) => setProduto({...produto, estoque_minimo: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded-md bg-background"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={salvando} className="flex-1">
                  {salvando ? 'Salvando...' : (editando ? 'Atualizar Produto' : 'Cadastrar Produto')}
                </Button>
                {editando && (
                  <Button type="button" variant="outline" onClick={cancelarEdicao}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Carregando produtos...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {produtos.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Nenhum produto cadastrado</p>
                ) : (
                  produtos.sort((a, b) => a.nome.localeCompare(b.nome)).map(prod => (
                    <div key={prod.id} className="flex items-center justify-between p-3 border rounded-md bg-background">
                      <div className="flex-1">
                        <h4 className="font-medium">{prod.nome}</h4>
                        <p className="text-sm text-gray-600">
                          {prod.categoria} • {prod.unidade_medida} • Mín: {prod.estoque_minimo}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editarProduto(prod)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => excluirProduto(prod.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Componente para entrada de estoque
  const EntradaEstoque = () => {
    try {
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
      const [salvando, setSalvando] = useState(false)
      const [carregado, setCarregado] = useState(false)

      useEffect(() => {
        const carregarDados = async () => {
          try {
            const [produtosRes, fornecedoresRes] = await Promise.all([
              fetch('https://mzhyi8c1dev6.manus.space/api/produtos'),
              fetch('https://mzhyi8c1dev6.manus.space/api/fornecedores')
            ])
            
            if (produtosRes.ok) {
              const produtosData = await produtosRes.json()
              setProdutos(produtosData.data || produtosData || [])
            }
            
            if (fornecedoresRes.ok) {
              const fornecedoresData = await fornecedoresRes.json()
              setFornecedores(fornecedoresData.data || fornecedoresData || [])
            }
          } catch (error) {
            console.error('Erro ao carregar dados:', error)
          } finally {
            setCarregado(true)
          }
        }
        
        carregarDados()
      }, [])

      const handleSubmit = async (e) => {
        e.preventDefault()
        setSalvando(true)

        try {
          const response = await fetch('https://mzhyi8c1dev6.manus.space/api/estoque/entradas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
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
            alert('Erro ao registrar entrada')
          }
        } catch (error) {
          alert('Erro na conexão')
        } finally {
          setSalvando(false)
        }
      }

      if (!carregado) {
        return (
          <Card className="bg-card border-2 border-blue-500">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando...</p>
            </CardContent>
          </Card>
        )
      }

      return (
        <Card className="bg-card border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Entrada de Estoque</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Produto</label>
                  <select
                    value={entrada.produto_id}
                    onChange={(e) => setEntrada({...entrada, produto_id: e.target.value})}
                    className="w-full p-2 border rounded-md bg-background"
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
                  <label className="block text-sm font-medium mb-2">Fornecedor</label>
                  <select
                    value={entrada.fornecedor_id}
                    onChange={(e) => setEntrada({...entrada, fornecedor_id: e.target.value})}
                    className="w-full p-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map(fornecedor => (
                      <option key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quantidade</label>
                  <input
                    type="number"
                    value={entrada.quantidade}
                    onChange={(e) => setEntrada({...entrada, quantidade: e.target.value})}
                    className="w-full p-2 border rounded-md bg-background"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lote</label>
                  <input
                    type="text"
                    value={entrada.lote}
                    onChange={(e) => setEntrada({...entrada, lote: e.target.value})}
                    className="w-full p-2 border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Validade</label>
                  <input
                    type="date"
                    value={entrada.validade}
                    onChange={(e) => setEntrada({...entrada, validade: e.target.value})}
                    className="w-full p-2 border rounded-md bg-background"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Número da NF</label>
                <input
                  type="text"
                  value={entrada.numero_nf}
                  onChange={(e) => setEntrada({...entrada, numero_nf: e.target.value})}
                  className="w-full p-2 border rounded-md bg-background"
                  required
                />
              </div>

              <Button type="submit" disabled={salvando} className="w-full">
                {salvando ? 'Salvando...' : 'Registrar Entrada'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )
    } catch (error) {
      console.error('Erro no componente EntradaEstoque:', error)
      return (
        <Card className="bg-card border-2 border-red-500">
          <CardContent className="p-8 text-center">
            <p className="text-red-500">Erro ao carregar componente de entrada</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      )
    }
  }

  // Componente para saída de estoque
  const SaidaEstoque = () => {
    const [saida, setSaida] = useState({
      produto_id: '',
      quantidade: '',
      local_destino: ''
    })
    const [produtos, setProdutos] = useState([])
    const [salvando, setSalvando] = useState(false)
    const [carregado, setCarregado] = useState(false)

    useEffect(() => {
      const carregarProdutos = async () => {
        try {
          const response = await fetch('https://mzhyi8c1dev6.manus.space/api/produtos')
          if (response.ok) {
            const data = await response.json()
            setProdutos(data.data || data || [])
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
        const response = await fetch('https://mzhyi8c1dev6.manus.space/api/estoque/saidas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(saida)
        })

        if (response.ok) {
          alert('Saída registrada com sucesso!')
          setSaida({
            produto_id: '',
            quantidade: '',
            local_destino: ''
          })
          if (window.atualizarMetricas) {
            window.atualizarMetricas()
          }
        } else {
          alert('Erro ao registrar saída')
        }
      } catch (error) {
        alert('Erro na conexão')
      } finally {
        setSalvando(false)
      }
    }

    if (!carregado) {
      return (
        <Card className="bg-card border-2 border-orange-500">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando...</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="bg-card border-2 border-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5" />
            <span>Saída de Estoque</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Produto</label>
              <select
                value={saida.produto_id}
                onChange={(e) => setSaida({...saida, produto_id: e.target.value})}
                className="w-full p-2 border rounded-md bg-background"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantidade</label>
                <input
                  type="number"
                  value={saida.quantidade}
                  onChange={(e) => setSaida({...saida, quantidade: e.target.value})}
                  className="w-full p-2 border rounded-md bg-background"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Local de Destino</label>
                <select
                  value={saida.local_destino}
                  onChange={(e) => setSaida({...saida, local_destino: e.target.value})}
                  className="w-full p-2 border rounded-md bg-background"
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

            <Button type="submit" disabled={salvando} className="w-full">
              {salvando ? 'Salvando...' : 'Registrar Saída'}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Clínica Veterinária PUC Campinas - v2.0</h1>
        </div>
      </header>

      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? `${tab.color} text-primary border-current`
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total de Produtos"
                value={metricas.total_produtos.valor}
                label={metricas.total_produtos.label}
                icon={Package}
                color="border-green-500"
              />
              <MetricCard
                title="Itens em Estoque"
                value={metricas.total_itens_estoque.valor.toLocaleString()}
                label={metricas.total_itens_estoque.label}
                icon={Activity}
                color="border-blue-500"
              />
              <MetricCard
                title="Entradas do Mês"
                value={metricas.entradas_mes.valor}
                label={metricas.entradas_mes.label}
                variation={metricas.entradas_mes.variacao}
                icon={TrendingUp}
                color="border-orange-500"
              />
              <MetricCard
                title="Estoque Baixo"
                value={metricas.produtos_estoque_baixo.valor}
                label={metricas.produtos_estoque_baixo.label}
                status={metricas.produtos_estoque_baixo.status}
                icon={AlertTriangle}
                color="border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Saídas do Mês"
                value={metricas.saidas_mes.valor}
                label={metricas.saidas_mes.label}
                variation={metricas.saidas_mes.variacao}
                icon={TrendingDown}
                color="border-purple-500"
              />
              <MetricCard
                title="Validade Próxima"
                value={metricas.produtos_validade_proxima.valor}
                label={metricas.produtos_validade_proxima.label}
                status={metricas.produtos_validade_proxima.status}
                icon={Calendar}
                color="border-yellow-500"
              />
              <MetricCard
                title="Pedidos Pendentes"
                value={metricas.pedidos_pendentes.valor}
                label={metricas.pedidos_pendentes.label}
                status={metricas.pedidos_pendentes.status}
                icon={ShoppingCart}
                color="border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-2 border-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Tendência de Movimentações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={movimentacoes}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="periodo" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="entradas" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Entradas"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="saidas" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        name="Saídas"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-2 border-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Distribuição por Locais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={distribuicaoLocais}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ local, quantidade }) => quantidade > 0 ? `${local}: ${quantidade}` : ''}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantidade"
                      >
                        {distribuicaoLocais.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-2 border-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Alertas e Notificações</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertas.map((alerta, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted">
                      <Package className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium">{alerta.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
                      </div>
                      <Badge variant={alerta.prioridade === 'alta' ? 'destructive' : alerta.prioridade === 'info' ? 'default' : 'secondary'}>
                        {alerta.prioridade}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'entradas' && <EntradaEstoque />}
        {activeTab === 'saidas' && <SaidaEstoque />}
        {activeTab === 'produtos' && <CadastrarProduto />}
        
        {(activeTab === 'importacao' || activeTab === 'relatorios') && (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>
                {tabs.find(tab => tab.id === activeTab)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento. Esta seção conterá as funcionalidades de {activeTab}.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default App

