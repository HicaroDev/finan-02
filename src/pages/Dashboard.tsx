
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

interface DashboardStats {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  transacoesRecentes: Array<{
    id: number
    estabelecimento: string
    valor: number
    tipo: string
    quando: string
    categorias?: {
      nome: string
    }
  }>
  lembretesProximos: Array<{
    id: number
    descricao: string
    data: string
    valor: number
  }>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    transacoesRecentes: [],
    lembretesProximos: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Buscar transações do mês atual
      const currentMonth = new Date().toISOString().slice(0, 7)
      
      const { data: transacoes, error: transacoesError } = await supabase
        .from('transacoes')
        .select(`
          *,
          categorias (
            nome
          )
        `)
        .eq('userid', user?.id)
        .gte('quando', `${currentMonth}-01`)
        .lte('quando', `${currentMonth}-31`)
        .order('created_at', { ascending: false })

      if (transacoesError) throw transacoesError

      // Calcular estatísticas
      const receitas = transacoes?.filter(t => t.tipo === 'receita') || []
      const despesas = transacoes?.filter(t => t.tipo === 'despesa') || []
      
      const totalReceitas = receitas.reduce((acc, t) => acc + (Number(t.valor) || 0), 0)
      const totalDespesas = despesas.reduce((acc, t) => acc + (Number(t.valor) || 0), 0)
      
      // Buscar lembretes próximos
      const { data: lembretes, error: lembretesError } = await supabase
        .from('lembretes')
        .select('*')
        .eq('userid', user?.id)
        .gte('data', new Date().toISOString().split('T')[0])
        .order('data', { ascending: true })
        .limit(5)

      if (lembretesError) throw lembretesError

      setStats({
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        transacoesRecentes: transacoes?.slice(0, 5) || [],
        lembretesProximos: lembretes || []
      })
    } catch (error: any) {
      console.error('Erro ao carregar dados do dashboard:', error)
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas finanças
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receitas do Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalReceitas)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Despesas do Mês
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalDespesas)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Transações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.transacoesRecentes.length > 0 ? (
                stats.transacoesRecentes.map((transacao) => (
                  <div key={transacao.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{transacao.estabelecimento}</p>
                      <p className="text-sm text-muted-foreground">
                        {transacao.categorias?.nome} • {formatDate(transacao.quando)}
                      </p>
                    </div>
                    <div className={`font-medium ${
                      transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(Number(transacao.valor))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma transação encontrada
                </p>
              )}
            </div>
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link to="/transacoes">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ver Todas as Transações
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lembretes Próximos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Lembretes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lembretesProximos.length > 0 ? (
                stats.lembretesProximos.map((lembrete) => (
                  <div key={lembrete.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{lembrete.descricao}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(lembrete.data)}
                      </p>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(lembrete.valor)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum lembrete próximo
                </p>
              )}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/lembretes">
                  Ver Todos os Lembretes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
