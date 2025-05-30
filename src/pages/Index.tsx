
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Users, 
  FileText, 
  Euro, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import ArticleManagement from "@/components/ArticleManagement";
import ClientManagement from "@/components/ClientManagement";
import ProposalManagement from "@/components/ProposalManagement";
import CommissionManagement from "@/components/CommissionManagement";
import TemplateManagement from "@/components/TemplateManagement";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data para o dashboard
  const dashboardStats = {
    totalArticles: 24,
    totalClients: 18,
    openProposals: 7,
    pendingCommissions: 2450.50
  };

  const recentActivity = [
    { type: "proposal", action: "Nova proposta criada", client: "TechCorp", value: "€2,500" },
    { type: "commission", action: "Comissão paga", commercial: "João Silva", value: "€150" },
    { type: "client", action: "Cliente adicionado", client: "InnovaTech", value: "" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sistema de Gestão Comercial
          </h1>
          <p className="text-gray-600">
            Gerir artigos, clientes, propostas e comissões de forma eficiente
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Artigos
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Propostas
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Comissões
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Artigos</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{dashboardStats.totalArticles}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 este mês
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{dashboardStats.totalClients}</div>
                  <p className="text-xs text-muted-foreground">
                    +3 este mês
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Propostas Abertas</CardTitle>
                  <FileText className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{dashboardStats.openProposals}</div>
                  <p className="text-xs text-muted-foreground">
                    2 enviadas hoje
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
                  <Euro className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">€{dashboardStats.pendingCommissions.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    A pagar este mês
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>
                  Últimas ações no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {activity.type === "proposal" && <FileText className="w-4 h-4 text-blue-600" />}
                        {activity.type === "commission" && <Euro className="w-4 h-4 text-green-600" />}
                        {activity.type === "client" && <Users className="w-4 h-4 text-purple-600" />}
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-600">
                            {activity.client && `Cliente: ${activity.client}`}
                            {activity.commercial && `Comercial: ${activity.commercial}`}
                          </p>
                        </div>
                      </div>
                      {activity.value && (
                        <Badge variant="outline" className="font-semibold">
                          {activity.value}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <ArticleManagement />
          </TabsContent>

          <TabsContent value="clients">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="proposals">
            <ProposalManagement />
          </TabsContent>

          <TabsContent value="commissions">
            <CommissionManagement />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
