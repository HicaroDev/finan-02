
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { CreditCard, Calendar, DollarSign, RefreshCw, Clock } from 'lucide-react'

interface SubscriptionData {
  id: string
  dataAssinatura: string
  valor: number
  ciclo: string
  status: string
  proimoPagamento: string
  creditCard: {
    creditCardNumber: string
    creditCardBrand: string
    creditCardToken: string
  }
}

export function SubscriptionInfo() {
  const { user } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [assinaturaId, setAssinaturaId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  useEffect(() => {
    if (assinaturaId) {
      fetchSubscriptionInfo()
    }
  }, [assinaturaId])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('assinaturaId')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      
      if (data?.assinaturaId) {
        setAssinaturaId(data.assinaturaId)
      } else {
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error)
      setLoading(false)
    }
  }

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('https://n8n.za9.com.br/webhook-test/assinatura/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic bmluZWxhYnM6bmluZWxhYnMxMjMxMjM='
        },
        body: new URLSearchParams({
          subscription: assinaturaId!
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar informações da assinatura')
      }

      const data = await response.json()
      setSubscriptionData(data)
    } catch (error: any) {
      console.error('Erro ao buscar assinatura:', error)
      toast({
        title: "Erro ao carregar assinatura",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'MONTHLY':
        return 'Mensal'
      case 'YEARLY':
        return 'Anual'
      case 'QUARTERLY':
        return 'Trimestral'
      default:
        return cycle
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">Inativo</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelado</Badge>
      case 'SUSPENDED':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Suspenso</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase()
    if (brandLower.includes('visa')) return '💳'
    if (brandLower.includes('master')) return '💳'
    if (brandLower.includes('american')) return '💳'
    return '💳'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informações da Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!assinaturaId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informações da Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Você não possui uma assinatura ativa</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscriptionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informações da Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive">Erro ao carregar informações da assinatura</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Informações da Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Data da Assinatura</p>
                <p className="font-medium">{formatDate(subscriptionData.dataAssinatura)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium text-lg">{formatCurrency(subscriptionData.valor)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Próximo Pagamento</p>
                <p className="font-medium">{formatDate(subscriptionData.proimoPagamento)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ciclo</p>
                <p className="font-medium">{getCycleLabel(subscriptionData.ciclo)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-5 w-5 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-current"></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  {getStatusBadge(subscriptionData.status)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Método de Pagamento
          </h4>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">{getBrandIcon(subscriptionData.creditCard.creditCardBrand)}</span>
              <div>
                <p className="font-medium">
                  {subscriptionData.creditCard.creditCardBrand} •••• {subscriptionData.creditCard.creditCardNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cartão terminado em {subscriptionData.creditCard.creditCardNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          ID da Assinatura: {subscriptionData.id}
        </div>
      </CardContent>
    </Card>
  )
}
