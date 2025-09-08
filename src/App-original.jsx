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
  const [metricas, setMetricas] = useState(null)
  const [movimentacoes, setMovimentacoes] = useState([])
  const [distribuicaoLocais, setDistribuicaoLocais] = useState([])
  const [alertas, setAlertas] = useState([])

  // Carregar dados das APIs
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar métricas
        const resMetricas = await fetch('http://localhost:5000/api/dashboard/metricas')
        const dataMetricas = await resMetricas.json()
        if (dataMetricas.success) {
          setMetricas(dataMetricas.data)
        }

        // Carregar movimentações
        const resMovimentacoes = await fetch('http://localhost:5000/api/dashboard/graficos/movimentacoes')
        const dataMovimentacoes = await resMovimentacoes.json()
        if (dataMovimentacoes.success) {
          setMovimentacoes(dataMovimentacoes.data)
        }

        // Carregar distribuição por locais
        const resDistribuicao = await fetch('http://localhost:5000/api/dashboard/graficos/distribuicao-locais')
        const dataDistribuicao = await resDistribuicao.json()
        if (dataDistribuicao.success) {
          setDistribuicaoLocais(dataDistribuicao.data)
        }

        // Carregar alertas
        const resAlertas = await fetch('http://localhost:5000/api/dashboard/alertas')
        const dataAlertas = await resAlertas.json()
        if (dataAlertas.success) {
          setAlertas(dataAlertas.data)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }

    carregarDados()
  }, [])

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', color: 'border-green-500' },
    { id: 'entradas', label: 'Entradas', color: 'border-blue-500' },
    { id: 'saidas', label: 'Saídas', color: 'border-orange-500' },
    { id: 'produtos', label: 'Produtos', color: 'border-purple-500' },
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

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Gestão de Estoque</h1>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`rounded-none border-b-2 ${
                  activeTab === tab.id ? tab.color : 'border-transparent'
                } hover:bg-accent`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            {metricas && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total de Produtos"
                  value={metricas.total_produtos?.valor || 0}
                  label={metricas.total_produtos?.label || ''}
                  icon={Package}
                  color="border-green-500"
                />
                <MetricCard
                  title="Itens em Estoque"
                  value={metricas.total_itens_estoque?.valor || 0}
                  label={metricas.total_itens_estoque?.label || ''}
                  icon={Activity}
                  color="border-blue-500"
                />
                <MetricCard
                  title="Entradas do Mês"
                  value={metricas.entradas_mes?.valor || 0}
                  label={metricas.entradas_mes?.label || ''}
                  variation={metricas.entradas_mes?.variacao}
                  icon={TrendingUp}
                  color="border-orange-500"
                />
                <MetricCard
                  title="Estoque Baixo"
                  value={metricas.produtos_estoque_baixo?.valor || 0}
                  label={metricas.produtos_estoque_baixo?.label || ''}
                  status={metricas.produtos_estoque_baixo?.status}
                  icon={AlertTriangle}
                  color="border-red-500"
                />
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Movimentações Chart */}
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

              {/* Distribuição por Locais */}
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
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantidade"
                        nameKey="local"
                      >
                        {distribuicaoLocais.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {distribuicaoLocais.map((item, index) => (
                      <div key={item.local} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-muted-foreground">{item.local}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas */}
            {alertas.length > 0 && (
              <Card className="bg-card border-2 border-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Alertas Importantes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alertas.map((alerta, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">{alerta.titulo}</h4>
                          <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
                        </div>
                        <Badge variant={alerta.prioridade === 'alta' ? 'destructive' : 'secondary'}>
                          {alerta.prioridade}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Outras abas - placeholder */}
        {activeTab !== 'overview' && (
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

