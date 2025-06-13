
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

interface DashboardStats {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  transacoesCount: number
  lembretesCount: number
}

interface Transacao {
  id: number
  created_at: string
  quando: string | null
  estabelecimento: string | null
  valor: number | null
  detalhes: string | null
  tipo: string | null
  categoria: string | null
  userid: string | null
}

interface Lembrete {
  id: number
  created_at: string
  userid: string | null
  descricao: string | null
  data: string | null
  valor: number | null
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    transacoesCount: 0,
    lembretesCount: 0,
  })
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString())
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    if (user?.id) {
      console.log('Dashboard: Loading data for user:', user.id)
      fetchDashboardData()
    }
  }, [user?.id, filterMonth, filterYear])

  const fetchDashboardData = async () => {
    if (!user?.id) {
      console.error('Dashboard: No user ID available')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Dashboard: Fetching data for filters:', { month: filterMonth, year: filterYear })

      // Criar datas de início e fim do período
      const startDate = new Date(parseInt(filterYear), parseInt(filterMonth), 1)
      const endDate = new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0, 23, 59, 59)
      
      console.log('Dashboard: Date range:', { startDate, endDate })

      // Buscar transações - usando campo 'quando' para filtro de data e 'userid' ao invés de 'userId'
      const { data: transacoes, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('userid', user.id)
        .gte('quando', startDate.toISOString().split('T')[0])
        .lte('quando', endDate.toISOString().split('T')[0])
        .order('quando', { ascending: false })

      if (transacoesError) {
        console.error('Dashboard: Error fetching transactions:', transacoesError)
        throw transacoesError
      }

      console.log('Dashboard: Transactions fetched:', transacoes?.length || 0)

      // Buscar lembretes - formatando datas corretamente e usando 'userid' ao invés de 'userId'
      const { data: lembretes, error: lembretesError } = await supabase
        .from('lembretes')
        .select('*')
        .eq('userid', user.id)
        .gte('data', startDate.toISOString().split('T')[0])
        .lte('data', endDate.toISOString().split('T')[0])
        .order('data', { ascending: true })

      if (lembretesError) {
        console.error('Dashboard: Error fetching lembretes:', lembretesError)
        throw lembretesError
      }

      console.log('Dashboard: Lembretes fetched:', lembretes?.length || 0)

      setTransacoes(transacoes || [])
      setLembretes(lembretes || [])

      // Calcular estatísticas
      const receitas = transacoes?.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + (t.valor || 0), 0) || 0
      const despesas = transacoes?.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + (t.valor || 0), 0) || 0

      const newStats = {
        totalReceitas: receitas,
        totalDespesas: despesas,
        saldo: receitas - despesas,
        transacoesCount: transacoes?.length || 0,
        lembretesCount: lembretes?.length || 0,
      }

      console.log('Dashboard: Calculated stats:', newStats)
      setStats(newStats)

    } catch (error: any) {
      console.error('Dashboard: Error loading data:', error)
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Erro desconhecido ao carregar dados do dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardFilters 
          filterMonth={filterMonth}
          filterYear={filterYear}
          setFilterMonth={setFilterMonth}
          setFilterYear={setFilterYear}
          transactionCount={0}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  // Show error state if no user
  if (!user?.id) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold text-muted-foreground mb-2">Usuário não encontrado</h2>
          <p className="text-muted-foreground">Faça login para visualizar seu dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardFilters 
        filterMonth={filterMonth}
        filterYear={filterYear}
        setFilterMonth={setFilterMonth}
        setFilterYear={setFilterYear}
        transactionCount={transacoes.length}
      />

      <DashboardStats stats={stats} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCharts transacoes={transacoes} stats={stats} />
        </div>
        <DashboardSidebar lembretes={lembretes} />
      </div>
    </div>
  )
}
