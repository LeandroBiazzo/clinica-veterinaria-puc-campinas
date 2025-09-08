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

  // Dados mockados para demonstração
  const metricas = {
    total_produtos: { valor: 8, label: 'Produtos Cadastrados' },
    total_itens_estoque: { valor: 2125, label: 'Total de Itens' },
    entradas_mes: { valor: 3, label: 'Entradas do Mês', variacao: 15.2 },
    produtos_estoque_baixo: { valor: 2, label: 'Estoque Baixo', status: 'alerta' },
    produtos_validade_proxima: { valor: 1, label: 'Validade Próxima', status: 'alerta' },
    saidas_mes: { valor: 5, label: 'Saídas do Mês', variacao: -8.3 },
    pedidos_pendentes: { valor: 3, label: 'Pedidos Pendentes', status: 'alerta' }
  }

  const movimentacoes = [
    { periodo: 'Jul/2025', entradas: 450, saidas: 320 },
    { periodo: 'Ago/2025', entradas: 380, saidas: 410 },
    { periodo: 'Set/2025', entradas: 520, saidas: 380 },
    { periodo: 'Out/2025', entradas: 420, saidas: 450 },
    { periodo: 'Nov/2025', entradas: 480, saidas: 390 },
    { periodo: 'Dez/2025', entradas: 510, saidas: 420 }
  ]

  const distribuicaoLocais = [
    { local: 'Farmácia', quantidade: 450, cor: '#3B82F6' },
    { local: 'Lab. Clínico', quantidade: 320, cor: '#10B981' },
    { local: 'Centro Cirúrgico', quantidade: 280, cor: '#F59E0B' },
    { local: 'Lab. Reprodução', quantidade: 180, cor: '#EF4444' },
    { local: 'Clínica Grandes', quantidade: 150, cor: '#8B5CF6' },
    { local: 'Aula Externa', quantidade: 120, cor: '#06B6D4' }
  ]

  const alertas = [
    {
      tipo: 'estoque_baixo',
      titulo: '2 produto(s) com estoque baixo',
      descricao: 'Alguns produtos estão abaixo do estoque mínimo',
      prioridade: 'alta'
    },
    {
      tipo: 'validade_proxima',
      titulo: '1 produto(s) com validade próxima',
      descricao: 'Produtos vencem nos próximos 30 dias',
      prioridade: 'media'
    },
    {
      tipo: 'pedidos_antigos',
      titulo: '3 pedido(s) pendente(s) há mais de 7 dias',
      descricao: 'Pedidos que precisam de atenção',
      prioridade: 'media'
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

  // Estado para importação
  const [importacao, setImportacao] = useState({
    arquivo: null,
    tipoImportacao: 'produtos',
    etapa: 'upload', // upload, mapeamento, processando, resultado
    preview: [],
    colunas: [],
    mapeamento: {},
    resultado: null
  })

  // Função para upload de arquivo
  const handleFileUpload = async (event) => {
    const arquivo = event.target.files[0]
    if (!arquivo) return

    const formData = new FormData()
    formData.append('arquivo', arquivo)
    formData.append('tipo_dados', importacao.tipoImportacao)

    setImportacao(prev => ({ ...prev, etapa: 'processando' }))

    try {
      const response = await fetch('http://localhost:5001/api/importacao/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setImportacao(prev => ({
          ...prev,
          arquivo: data.data.filename,
          preview: data.data.preview,
          colunas: data.data.colunas,
          etapa: 'mapeamento'
        }))
      } else {
        alert('Erro no upload: ' + data.message)
        setImportacao(prev => ({ ...prev, etapa: 'upload' }))
      }
    } catch (error) {
      alert('Erro na conexão: ' + error.message)
      setImportacao(prev => ({ ...prev, etapa: 'upload' }))
    }
  }

  // Função para processar importação
  const processarImportacao = async () => {
    setImportacao(prev => ({ ...prev, etapa: 'processando' }))

    try {
      const response = await fetch('http://localhost:5001/api/importacao/processar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filepath: `/tmp/${importacao.arquivo}`,
          tipo_dados: importacao.tipoImportacao,
          mapeamento: importacao.mapeamento
        })
      })
      
      const data = await response.json()
      
      setImportacao(prev => ({
        ...prev,
        resultado: data,
        etapa: 'resultado'
      }))
    } catch (error) {
      alert('Erro no processamento: ' + error.message)
      setImportacao(prev => ({ ...prev, etapa: 'mapeamento' }))
    }
  }

  // Componente de Importação
  const ImportacaoComponent = () => (
    <div className="space-y-6">
      <Card className="bg-card border-2 border-pink-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Importação de Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {importacao.etapa === 'upload' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Dados</label>
                <select 
                  value={importacao.tipoImportacao}
                  onChange={(e) => setImportacao(prev => ({ ...prev, tipoImportacao: e.target.value }))}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="produtos">Produtos</option>
                  <option value="fornecedores">Fornecedores</option>
                  <option value="estoque_atual">Estoque Atual</option>
                  <option value="entradas">Histórico de Entradas</option>
                  <option value="saidas">Histórico de Saídas</option>
                  <option value="locais">Locais de Destino</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Arquivo (CSV, XLS, XLSX)</label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="w-full p-2 border rounded-md bg-background"
                />
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Formato Esperado:</h4>
                <div className="text-sm text-muted-foreground">
                  {importacao.tipoImportacao === 'produtos' && (
                    <p>Colunas: nome, categoria, estoque_minimo</p>
                  )}
                  {importacao.tipoImportacao === 'fornecedores' && (
                    <p>Colunas: nome, contato, cnpj</p>
                  )}
                  {importacao.tipoImportacao === 'estoque_atual' && (
                    <p>Colunas: produto, quantidade, lote, validade</p>
                  )}
                  {importacao.tipoImportacao === 'entradas' && (
                    <p>Colunas: produto, fornecedor, quantidade, numero_nf, lote, data_entrada, validade</p>
                  )}
                  {importacao.tipoImportacao === 'saidas' && (
                    <p>Colunas: produto, local, quantidade, data_saida</p>
                  )}
                  {importacao.tipoImportacao === 'locais' && (
                    <p>Colunas: nome, descricao</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {importacao.etapa === 'mapeamento' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mapeamento de Colunas</h3>
              <p className="text-sm text-muted-foreground">
                Associe as colunas do seu arquivo com os campos do sistema:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {importacao.colunas.map((coluna, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium mb-1">
                      Coluna: {coluna}
                    </label>
                    <select 
                      value={importacao.mapeamento[coluna] || ''}
                      onChange={(e) => setImportacao(prev => ({
                        ...prev,
                        mapeamento: { ...prev.mapeamento, [coluna]: e.target.value }
                      }))}
                      className="w-full p-2 border rounded-md bg-background text-sm"
                    >
                      <option value="">Ignorar</option>
                      {importacao.tipoImportacao === 'produtos' && (
                        <>
                          <option value="nome">Nome</option>
                          <option value="categoria">Categoria</option>
                          <option value="estoque_minimo">Estoque Mínimo</option>
                        </>
                      )}
                      {importacao.tipoImportacao === 'fornecedores' && (
                        <>
                          <option value="nome">Nome</option>
                          <option value="contato">Contato</option>
                          <option value="cnpj">CNPJ</option>
                        </>
                      )}
                      {importacao.tipoImportacao === 'estoque_atual' && (
                        <>
                          <option value="produto">Produto</option>
                          <option value="quantidade">Quantidade</option>
                          <option value="lote">Lote</option>
                          <option value="validade">Validade</option>
                        </>
                      )}
                    </select>
                  </div>
                ))}
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Preview dos Dados:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {importacao.colunas.map((coluna, index) => (
                          <th key={index} className="text-left p-2 border-b">
                            {coluna}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importacao.preview.slice(0, 3).map((linha, index) => (
                        <tr key={index}>
                          {importacao.colunas.map((coluna, colIndex) => (
                            <td key={colIndex} className="p-2 border-b">
                              {linha[coluna]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setImportacao(prev => ({ ...prev, etapa: 'upload' }))}
                  variant="outline"
                >
                  Voltar
                </Button>
                <Button onClick={processarImportacao}>
                  Processar Importação
                </Button>
              </div>
            </div>
          )}
          
          {importacao.etapa === 'processando' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Processando importação...</p>
            </div>
          )}
          
          {importacao.etapa === 'resultado' && importacao.resultado && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resultado da Importação</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {importacao.resultado.data?.importados || 0}
                    </div>
                    <div className="text-sm text-green-600">Importados</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {importacao.resultado.data?.erros || 0}
                    </div>
                    <div className="text-sm text-red-600">Erros</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {((importacao.resultado.data?.importados || 0) / 
                        ((importacao.resultado.data?.importados || 0) + (importacao.resultado.data?.erros || 0)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-blue-600">Taxa de Sucesso</div>
                  </CardContent>
                </Card>
              </div>
              
              {importacao.resultado.data?.detalhes_erros && importacao.resultado.data.detalhes_erros.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="font-medium text-red-800 mb-2">Detalhes dos Erros:</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {importacao.resultado.data.detalhes_erros.map((erro, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        {erro}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={() => setImportacao({
                  arquivo: null,
                  tipoImportacao: 'produtos',
                  etapa: 'upload',
                  preview: [],
                  colunas: [],
                  mapeamento: {},
                  resultado: null
                })}
                className="w-full"
              >
                Nova Importação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Segunda linha de métricas */}
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
                      <div className="flex-1">
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
          </div>
        )}

        {/* Outras abas */}
        {activeTab === 'importacao' && <ImportacaoComponent />}
        
        {activeTab !== 'overview' && activeTab !== 'importacao' && (
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

