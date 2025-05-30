import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, FileText, Eye } from "lucide-react";
import { toast } from "sonner";

interface ProposalArticle {
  id: string;
  name: string;
  description: string;
  group: "Serviços" | "Pack de horas" | "Marketing" | "Sites";
  pvp: number;
  marginPercent: number;
  marginEuro: number;
  costPrice: number;
  commission: number;
  quantity: number;
  isFromCatalog: boolean; // indica se vem do catálogo ou é linha avulsa
  catalogArticleId?: string; // ID do artigo no catálogo se aplicável
}

interface Proposal {
  id: string;
  status: "Aberta" | "Enviada" | "Ganha" | "Perdida";
  clientId: string;
  clientName: string;
  articles: ProposalArticle[];
  totalValue: number;
  totalCommission: number;
  createdDate: string;
}

const ProposalManagement = () => {
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: "1",
      status: "Enviada",
      clientId: "1",
      clientName: "TechCorp Solutions",
      articles: [
        {
          id: "1",
          name: "Desenvolvimento Website",
          description: "Criação de website corporativo",
          group: "Sites",
          pvp: 2500,
          marginPercent: 60,
          marginEuro: 1500,
          costPrice: 1000,
          commission: 112.50,
          quantity: 1,
          isFromCatalog: true,
          catalogArticleId: "1"
        }
      ],
      totalValue: 2500,
      totalCommission: 112.50,
      createdDate: "2024-05-28"
    },
    {
      id: "2",
      status: "Aberta",
      clientId: "2",
      clientName: "InnovaTech",
      articles: [
        {
          id: "2",
          name: "Campanha Google Ads",
          description: "Gestão de campanha publicitária",
          group: "Marketing",
          pvp: 800,
          marginPercent: 50,
          marginEuro: 400,
          costPrice: 400,
          commission: 80,
          quantity: 3,
          isFromCatalog: true,
          catalogArticleId: "2"
        }
      ],
      totalValue: 2400,
      totalCommission: 240,
      createdDate: "2024-05-30"
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [formData, setFormData] = useState({
    status: "",
    clientId: "",
    clientName: ""
  });

  // Estados para gestão de artigos
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ProposalArticle | null>(null);
  const [articleFormData, setArticleFormData] = useState({
    type: "catalog", // "catalog" ou "custom"
    catalogArticleId: "",
    name: "",
    description: "",
    group: "",
    pvp: "",
    marginPercent: "",
    marginEuro: "",
    costPrice: "",
    quantity: "1"
  });

  // Mock data de clientes
  const clients = [
    { id: "1", name: "TechCorp Solutions" },
    { id: "2", name: "InnovaTech" },
    { id: "3", name: "DigitalPro" }
  ];

  // Mock data de artigos disponíveis
  const availableArticles = [
    {
      id: "1",
      name: "Desenvolvimento Website",
      description: "Criação de website corporativo",
      group: "Sites" as const,
      pvp: 2500,
      marginPercent: 60,
      marginEuro: 1500,
      costPrice: 1000,
      commission: 112.50
    },
    {
      id: "2",
      name: "Campanha Google Ads",
      description: "Gestão de campanha publicitária",
      group: "Marketing" as const,
      pvp: 800,
      marginPercent: 50,
      marginEuro: 400,
      costPrice: 400,
      commission: 80
    }
  ];

  const [newArticle, setNewArticle] = useState({
    articleId: "",
    quantity: "1"
  });

  // Funções de cálculo
  const calculateCommission = (group: string, marginEuro: number) => {
    const rates = {
      "Serviços": 0.05,
      "Pack de horas": 0.10,
      "Marketing": 0.20,
      "Sites": 0.075
    };
    return marginEuro * (rates[group as keyof typeof rates] || 0);
  };

  const calculateFromMarginPercent = (pvp: number, marginPercent: number) => {
    const marginEuro = (pvp * marginPercent) / 100;
    const costPrice = pvp - marginEuro;
    return { marginEuro, costPrice };
  };

  const calculateFromMarginEuro = (pvp: number, marginEuro: number) => {
    const marginPercent = (marginEuro / pvp) * 100;
    const costPrice = pvp - marginEuro;
    return { marginPercent, costPrice };
  };

  const resetForm = () => {
    setFormData({
      status: "Aberta",
      clientId: "",
      clientName: ""
    });
    setEditingProposal(null);
    setSelectedProposal(null);
  };

  const resetArticleForm = () => {
    setArticleFormData({
      type: "catalog",
      catalogArticleId: "",
      name: "",
      description: "",
      group: "",
      pvp: "",
      marginPercent: "",
      marginEuro: "",
      costPrice: "",
      quantity: "1"
    });
    setEditingArticle(null);
    setIsAddingArticle(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "clientId") {
      const client = clients.find(c => c.id === value);
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        clientName: client?.name || ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArticleInputChange = (field: string, value: string) => {
    setArticleFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Se selecionou artigo do catálogo, preencher campos
      if (field === "catalogArticleId" && value) {
        const article = availableArticles.find(a => a.id === value);
        if (article) {
          return {
            ...newData,
            name: article.name,
            description: article.description,
            group: article.group,
            pvp: article.pvp.toString(),
            marginPercent: article.marginPercent.toString(),
            marginEuro: article.marginEuro.toString(),
            costPrice: article.costPrice.toString()
          };
        }
      }

      // Cálculos automáticos para linhas customizadas
      if (field === "pvp" || field === "marginPercent" || field === "marginEuro") {
        const pvp = parseFloat(field === "pvp" ? value : newData.pvp) || 0;
        
        if (field === "marginPercent" && value) {
          const marginPercent = parseFloat(value);
          const { marginEuro, costPrice } = calculateFromMarginPercent(pvp, marginPercent);
          newData.marginEuro = marginEuro.toFixed(2);
          newData.costPrice = costPrice.toFixed(2);
        } else if (field === "marginEuro" && value) {
          const marginEuro = parseFloat(value);
          const { marginPercent, costPrice } = calculateFromMarginEuro(pvp, marginEuro);
          newData.marginPercent = marginPercent.toFixed(2);
          newData.costPrice = costPrice.toFixed(2);
        }
      }

      return newData;
    });
  };

  const handleSubmit = () => {
    if (!formData.clientId || !formData.status) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    const proposalData: Proposal = {
      id: editingProposal?.id || Date.now().toString(),
      status: formData.status as Proposal["status"],
      clientId: formData.clientId,
      clientName: formData.clientName,
      articles: editingProposal?.articles || [],
      totalValue: 0,
      totalCommission: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };

    // Recalcular totais
    proposalData.totalValue = proposalData.articles.reduce((sum, art) => sum + (art.pvp * art.quantity), 0);
    proposalData.totalCommission = proposalData.articles.reduce((sum, art) => sum + art.commission, 0);

    if (editingProposal) {
      setProposals(prev => prev.map(p => p.id === editingProposal.id ? proposalData : p));
      toast.success("Proposta atualizada com sucesso!");
    } else {
      setProposals(prev => [...prev, proposalData]);
      toast.success("Proposta criada com sucesso!");
    }

    setIsCreating(false);
    resetForm();
  };

  const handleSubmitArticle = () => {
    if (!editingProposal) return;

    // Validações
    if (articleFormData.type === "catalog" && !articleFormData.catalogArticleId) {
      toast.error("Selecione um artigo do catálogo!");
      return;
    }

    if (articleFormData.type === "custom" && (!articleFormData.name || !articleFormData.group || !articleFormData.pvp)) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    const quantity = parseInt(articleFormData.quantity) || 1;
    const pvp = parseFloat(articleFormData.pvp) || 0;
    const marginEuro = parseFloat(articleFormData.marginEuro) || 0;
    const commission = calculateCommission(articleFormData.group, marginEuro) * quantity;

    const newArticle: ProposalArticle = {
      id: editingArticle?.id || Date.now().toString(),
      name: articleFormData.name,
      description: articleFormData.description,
      group: articleFormData.group as ProposalArticle["group"],
      pvp,
      marginPercent: parseFloat(articleFormData.marginPercent) || 0,
      marginEuro,
      costPrice: parseFloat(articleFormData.costPrice) || 0,
      commission,
      quantity,
      isFromCatalog: articleFormData.type === "catalog",
      catalogArticleId: articleFormData.type === "catalog" ? articleFormData.catalogArticleId : undefined
    };

    const updatedProposal = {
      ...editingProposal,
      articles: editingArticle 
        ? editingProposal.articles.map(a => a.id === editingArticle.id ? newArticle : a)
        : [...editingProposal.articles, newArticle]
    };

    // Recalcular totais
    updatedProposal.totalValue = updatedProposal.articles.reduce((sum, art) => sum + (art.pvp * art.quantity), 0);
    updatedProposal.totalCommission = updatedProposal.articles.reduce((sum, art) => sum + art.commission, 0);

    setProposals(prev => prev.map(p => p.id === editingProposal.id ? updatedProposal : p));
    setEditingProposal(updatedProposal);
    
    toast.success(editingArticle ? "Artigo atualizado!" : "Artigo adicionado!");
    resetArticleForm();
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setFormData({
      status: proposal.status,
      clientId: proposal.clientId,
      clientName: proposal.clientName
    });
    setIsCreating(true);
  };

  const handleEditArticle = (article: ProposalArticle) => {
    setEditingArticle(article);
    setArticleFormData({
      type: article.isFromCatalog ? "catalog" : "custom",
      catalogArticleId: article.catalogArticleId || "",
      name: article.name,
      description: article.description,
      group: article.group,
      pvp: article.pvp.toString(),
      marginPercent: article.marginPercent.toString(),
      marginEuro: article.marginEuro.toString(),
      costPrice: article.costPrice.toString(),
      quantity: article.quantity.toString()
    });
    setIsAddingArticle(true);
  };

  const handleDelete = (id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id));
    toast.success("Proposta eliminada com sucesso!");
  };

  const handleDeleteArticle = (articleId: string) => {
    if (!editingProposal) return;

    const updatedProposal = {
      ...editingProposal,
      articles: editingProposal.articles.filter(a => a.id !== articleId)
    };

    // Recalcular totais
    updatedProposal.totalValue = updatedProposal.articles.reduce((sum, art) => sum + (art.pvp * art.quantity), 0);
    updatedProposal.totalCommission = updatedProposal.articles.reduce((sum, art) => sum + art.commission, 0);

    setProposals(prev => prev.map(p => p.id === editingProposal.id ? updatedProposal : p));
    setEditingProposal(updatedProposal);
    toast.success("Artigo removido!");
  };

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsArticleDialogOpen(true);
  };

  const addArticleToProposal = () => {
    if (!newArticle.articleId || !selectedProposal) return;

    const article = availableArticles.find(a => a.id === newArticle.articleId);
    if (!article) return;

    const quantity = parseInt(newArticle.quantity) || 1;
    const proposalArticle: ProposalArticle = {
      ...article,
      quantity,
      commission: article.commission * quantity,
      isFromCatalog: true,
      catalogArticleId: article.id
    };

    const updatedProposal = {
      ...selectedProposal,
      articles: [...selectedProposal.articles, proposalArticle]
    };

    // Recalcular totais
    updatedProposal.totalValue = updatedProposal.articles.reduce((sum, art) => sum + (art.pvp * art.quantity), 0);
    updatedProposal.totalCommission = updatedProposal.articles.reduce((sum, art) => sum + art.commission, 0);

    setProposals(prev => prev.map(p => p.id === selectedProposal.id ? updatedProposal : p));
    setSelectedProposal(updatedProposal);
    setNewArticle({ articleId: "", quantity: "1" });
    toast.success("Artigo adicionado à proposta!");
  };

  const removeArticleFromProposal = (articleId: string) => {
    if (!selectedProposal) return;

    const updatedProposal = {
      ...selectedProposal,
      articles: selectedProposal.articles.filter(a => a.id !== articleId)
    };

    // Recalcular totais
    updatedProposal.totalValue = updatedProposal.articles.reduce((sum, art) => sum + (art.pvp * art.quantity), 0);
    updatedProposal.totalCommission = updatedProposal.articles.reduce((sum, art) => sum + art.commission, 0);

    setProposals(prev => prev.map(p => p.id === selectedProposal.id ? updatedProposal : p));
    setSelectedProposal(updatedProposal);
    toast.success("Artigo removido da proposta!");
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "Aberta": "bg-blue-100 text-blue-800",
      "Enviada": "bg-yellow-100 text-yellow-800",
      "Ganha": "bg-green-100 text-green-800",
      "Perdida": "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getGroupColor = (group: string) => {
    const colors = {
      "Serviços": "bg-blue-100 text-blue-800",
      "Pack de horas": "bg-green-100 text-green-800",
      "Marketing": "bg-purple-100 text-purple-800",
      "Sites": "bg-orange-100 text-orange-800"
    };
    return colors[group as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                Gestão de Propostas
              </CardTitle>
              <CardDescription>
                Gerir propostas comerciais com artigos e comissões
              </CardDescription>
            </div>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Proposta
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-6">
              <h3 className="text-lg font-semibold">
                {editingProposal ? "Editar Proposta" : "Nova Proposta"}
              </h3>
              
              {/* Formulário da proposta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientId">Cliente *</Label>
                  <Select value={formData.clientId} onValueChange={(value) => handleInputChange("clientId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Estado *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aberta">Aberta</SelectItem>
                      <SelectItem value="Enviada">Enviada</SelectItem>
                      <SelectItem value="Ganha">Ganha</SelectItem>
                      <SelectItem value="Perdida">Perdida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Artigos da proposta */}
              {editingProposal && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Artigos da Proposta</h4>
                    {!isAddingArticle && (
                      <Button onClick={() => setIsAddingArticle(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Artigo
                      </Button>
                    )}
                  </div>

                  {/* Formulário de artigo */}
                  {isAddingArticle && (
                    <div className="border rounded-lg p-4 bg-white space-y-4">
                      <h5 className="font-medium">{editingArticle ? "Editar Artigo" : "Novo Artigo"}</h5>
                      
                      {/* Tipo de artigo */}
                      <div>
                        <Label>Tipo de Artigo</Label>
                        <Select value={articleFormData.type} onValueChange={(value) => handleArticleInputChange("type", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="catalog">Do Catálogo</SelectItem>
                            <SelectItem value="custom">Linha Avulsa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Seleção de artigo do catálogo */}
                      {articleFormData.type === "catalog" && (
                        <div>
                          <Label>Artigo do Catálogo</Label>
                          <Select value={articleFormData.catalogArticleId} onValueChange={(value) => handleArticleInputChange("catalogArticleId", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar artigo" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableArticles.map(article => (
                                <SelectItem key={article.id} value={article.id}>
                                  {article.name} - €{article.pvp}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Campos do artigo */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nome *</Label>
                          <Input
                            value={articleFormData.name}
                            onChange={(e) => handleArticleInputChange("name", e.target.value)}
                            disabled={articleFormData.type === "catalog"}
                          />
                        </div>
                        <div>
                          <Label>Grupo *</Label>
                          <Select 
                            value={articleFormData.group} 
                            onValueChange={(value) => handleArticleInputChange("group", value)}
                            disabled={articleFormData.type === "catalog"}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar grupo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Serviços">Serviços</SelectItem>
                              <SelectItem value="Pack de horas">Pack de horas</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Sites">Sites</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Descrição</Label>
                        <Input
                          value={articleFormData.description}
                          onChange={(e) => handleArticleInputChange("description", e.target.value)}
                          disabled={articleFormData.type === "catalog"}
                        />
                      </div>

                      <div className="grid grid-cols-5 gap-4">
                        <div>
                          <Label>PVP (€) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={articleFormData.pvp}
                            onChange={(e) => handleArticleInputChange("pvp", e.target.value)}
                            disabled={articleFormData.type === "catalog"}
                          />
                        </div>
                        <div>
                          <Label>Margem %</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={articleFormData.marginPercent}
                            onChange={(e) => handleArticleInputChange("marginPercent", e.target.value)}
                            disabled={articleFormData.type === "catalog"}
                          />
                        </div>
                        <div>
                          <Label>Margem €</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={articleFormData.marginEuro}
                            onChange={(e) => handleArticleInputChange("marginEuro", e.target.value)}
                            disabled={articleFormData.type === "catalog"}
                          />
                        </div>
                        <div>
                          <Label>Preço Custo</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={articleFormData.costPrice}
                            readOnly
                            className="bg-gray-100"
                          />
                        </div>
                        <div>
                          <Label>Quantidade *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={articleFormData.quantity}
                            onChange={(e) => handleArticleInputChange("quantity", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={resetArticleForm}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSubmitArticle} className="bg-blue-600 hover:bg-blue-700">
                          {editingArticle ? "Atualizar" : "Adicionar"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Lista de artigos */}
                  {editingProposal.articles.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Artigo</TableHead>
                          <TableHead>Grupo</TableHead>
                          <TableHead>Qtd</TableHead>
                          <TableHead>PVP Unit.</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Comissão</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editingProposal.articles.map((article) => (
                          <TableRow key={article.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{article.name}</div>
                                <div className="text-sm text-gray-500">{article.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getGroupColor(article.group)}>
                                {article.group}
                              </Badge>
                            </TableCell>
                            <TableCell>{article.quantity}</TableCell>
                            <TableCell>€{article.pvp.toFixed(2)}</TableCell>
                            <TableCell>€{(article.pvp * article.quantity).toFixed(2)}</TableCell>
                            <TableCell>€{article.commission.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={article.isFromCatalog ? "default" : "secondary"}>
                                {article.isFromCatalog ? "Catálogo" : "Avulso"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditArticle(article)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteArticle(article.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {/* Totais */}
                  {editingProposal.articles.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Totais da Proposta:</span>
                        <div className="space-x-4">
                          <span>Valor: €{editingProposal.totalValue.toFixed(2)}</span>
                          <span>Comissão: €{editingProposal.totalCommission.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setIsCreating(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
                  {editingProposal ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Artigos</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Comissão Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell>
                    <div className="font-medium">{proposal.clientName}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{proposal.articles.length} artigo(s)</TableCell>
                  <TableCell>€{proposal.totalValue.toFixed(2)}</TableCell>
                  <TableCell>€{proposal.totalCommission.toFixed(2)}</TableCell>
                  <TableCell>{new Date(proposal.createdDate).toLocaleDateString('pt-PT')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProposal(proposal)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(proposal)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(proposal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para visualizar/editar artigos da proposta */}
      <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Proposta - {selectedProposal?.clientName}
            </DialogTitle>
            <DialogDescription>
              Gerir artigos da proposta
            </DialogDescription>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="space-y-6">
              {/* Adicionar novo artigo */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3">Adicionar Artigo</h4>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="articleSelect">Artigo</Label>
                    <Select value={newArticle.articleId} onValueChange={(value) => setNewArticle(prev => ({ ...prev, articleId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar artigo" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableArticles.map(article => (
                          <SelectItem key={article.id} value={article.id}>
                            {article.name} - €{article.pvp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label htmlFor="quantity">Qtd</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newArticle.quantity}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                  <Button onClick={addArticleToProposal} className="bg-blue-600 hover:bg-blue-700">
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Lista de artigos */}
              <div>
                <h4 className="font-semibold mb-3">Artigos da Proposta</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artigo</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>PVP Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProposal.articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{article.name}</div>
                            <div className="text-sm text-gray-500">{article.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGroupColor(article.group)}>
                            {article.group}
                          </Badge>
                        </TableCell>
                        <TableCell>{article.quantity}</TableCell>
                        <TableCell>€{article.pvp.toFixed(2)}</TableCell>
                        <TableCell>€{(article.pvp * article.quantity).toFixed(2)}</TableCell>
                        <TableCell>€{article.commission.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeArticleFromProposal(article.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totais */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Totais da Proposta:</span>
                  <div className="space-x-4">
                    <span>Valor: €{selectedProposal.totalValue.toFixed(2)}</span>
                    <span>Comissão: €{selectedProposal.totalCommission.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalManagement;
