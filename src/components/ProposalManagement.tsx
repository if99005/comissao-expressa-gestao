
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, X, FileText, Eye, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Article {
  id: string;
  reference: string;
  description: string;
  unit: string;
  sale_price: number;
  purchase_price: number;
  group_name?: string;
}

interface ProposalLine {
  id?: string;
  article_id?: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount_percentage: number;
  line_total: number;
  calculation_mode: 'pvp' | 'cost';
  margin_percentage: number;
  margin_euro: number;
}

interface Proposal {
  id?: string;
  number: string;
  client_id?: string;
  status: 'rascunho' | 'enviada' | 'aprovada' | 'rejeitada' | 'expirada';
  group_name?: string;
  proposal_date: string;
  expiry_date?: string;
  subtotal: number;
  discount_percentage: number;
  total: number;
  commission_percentage: number;
  notes?: string;
  client?: Client;
}

const ProposalManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [proposalForm, setProposalForm] = useState<Proposal>({
    number: '',
    status: 'rascunho',
    proposal_date: new Date().toISOString().split('T')[0],
    subtotal: 0,
    discount_percentage: 0,
    total: 0,
    commission_percentage: 0
  });
  const [proposalLines, setProposalLines] = useState<ProposalLine[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch propostas
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch clientes
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch artigos
  const { data: articles = [] } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('reference');
      
      if (error) throw error;
      return data;
    }
  });

  // Mutation para criar/atualizar proposta
  const proposalMutation = useMutation({
    mutationFn: async (proposal: Proposal) => {
      if (editingProposal) {
        const { data, error } = await supabase
          .from('proposals')
          .update(proposal)
          .eq('id', editingProposal.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('proposals')
          .insert(proposal)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: async (savedProposal) => {
      // Guardar linhas da proposta
      if (proposalLines.length > 0) {
        // Primeiro eliminar linhas existentes se estiver a editar
        if (editingProposal) {
          await supabase
            .from('proposal_lines')
            .delete()
            .eq('proposal_id', savedProposal.id);
        }

        // Inserir novas linhas
        const linesToInsert = proposalLines.map((line, index) => ({
          proposal_id: savedProposal.id,
          article_id: line.article_id,
          description: line.description,
          unit: line.unit,
          quantity: line.quantity,
          unit_price: line.unit_price,
          discount_percentage: line.discount_percentage,
          line_total: line.line_total,
          sort_order: index
        }));

        const { error } = await supabase
          .from('proposal_lines')
          .insert(linesToInsert);
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast({
        title: "Sucesso",
        description: editingProposal ? "Proposta atualizada!" : "Proposta criada!",
      });
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao guardar proposta:', error);
      toast({
        title: "Erro",
        description: "Erro ao guardar proposta",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingProposal(null);
    setProposalForm({
      number: '',
      status: 'rascunho',
      proposal_date: new Date().toISOString().split('T')[0],
      subtotal: 0,
      discount_percentage: 0,
      total: 0,
      commission_percentage: 0
    });
    setProposalLines([]);
  };

  const addProposalLine = () => {
    setProposalLines([...proposalLines, {
      description: '',
      unit: 'un',
      quantity: 1,
      unit_price: 0,
      cost_price: 0,
      discount_percentage: 0,
      line_total: 0,
      calculation_mode: 'pvp',
      margin_percentage: 0,
      margin_euro: 0
    }]);
  };

  const calculateLineFromPVP = (unitPrice: number, marginPercent: number) => {
    const marginEuro = (unitPrice * marginPercent) / 100;
    const costPrice = unitPrice - marginEuro;
    return { marginEuro, costPrice };
  };

  const calculateLineFromCost = (costPrice: number, marginValue: number, isPercentage: boolean) => {
    let marginEuro: number;
    let marginPercent: number;
    let unitPrice: number;

    if (isPercentage) {
      marginPercent = marginValue;
      marginEuro = (costPrice * marginPercent) / 100;
      unitPrice = costPrice + marginEuro;
    } else {
      marginEuro = marginValue;
      unitPrice = costPrice + marginEuro;
      marginPercent = costPrice > 0 ? (marginEuro / costPrice) * 100 : 0;
    }

    return { marginEuro, marginPercent, unitPrice };
  };

  const updateProposalLine = (index: number, field: keyof ProposalLine, value: any) => {
    const newLines = [...proposalLines];
    const line = newLines[index];
    
    // Atualizar o campo
    newLines[index] = { ...line, [field]: value };
    
    // Recalcular preços baseado no modo de cálculo
    if (field === 'calculation_mode') {
      // Reset values when changing calculation mode
      newLines[index] = {
        ...newLines[index],
        unit_price: 0,
        cost_price: 0,
        margin_percentage: 0,
        margin_euro: 0
      };
    } else if (line.calculation_mode === 'pvp') {
      // Calcular a partir do PVP
      if (field === 'unit_price' || field === 'margin_percentage') {
        const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : line.unit_price;
        const marginPercent = field === 'margin_percentage' ? parseFloat(value) || 0 : line.margin_percentage;
        
        if (unitPrice > 0 && marginPercent > 0) {
          const { marginEuro, costPrice } = calculateLineFromPVP(unitPrice, marginPercent);
          newLines[index] = {
            ...newLines[index],
            margin_euro: marginEuro,
            cost_price: costPrice
          };
        }
      }
    } else if (line.calculation_mode === 'cost') {
      // Calcular a partir do preço de custo
      if (field === 'cost_price' || field === 'margin_percentage' || field === 'margin_euro') {
        const costPrice = field === 'cost_price' ? parseFloat(value) || 0 : line.cost_price;
        
        if (costPrice > 0) {
          if (field === 'margin_percentage') {
            const marginPercent = parseFloat(value) || 0;
            const { marginEuro, unitPrice } = calculateLineFromCost(costPrice, marginPercent, true);
            newLines[index] = {
              ...newLines[index],
              margin_euro: marginEuro,
              unit_price: unitPrice
            };
          } else if (field === 'margin_euro') {
            const marginEuro = parseFloat(value) || 0;
            const { marginPercent, unitPrice } = calculateLineFromCost(costPrice, marginEuro, false);
            newLines[index] = {
              ...newLines[index],
              margin_percentage: marginPercent,
              unit_price: unitPrice
            };
          }
        }
      }
    }
    
    // Recalcular total da linha
    const updatedLine = newLines[index];
    const subtotal = updatedLine.quantity * updatedLine.unit_price;
    const discountAmount = subtotal * (updatedLine.discount_percentage / 100);
    updatedLine.line_total = subtotal - discountAmount;
    
    setProposalLines(newLines);
    calculateTotals(newLines);
  };

  const removeProposalLine = (index: number) => {
    const newLines = proposalLines.filter((_, i) => i !== index);
    setProposalLines(newLines);
    calculateTotals(newLines);
  };

  const calculateTotals = (lines: ProposalLine[]) => {
    const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
    const discountAmount = subtotal * (proposalForm.discount_percentage / 100);
    const total = subtotal - discountAmount;
    
    setProposalForm(prev => ({
      ...prev,
      subtotal,
      total
    }));
  };

  const selectArticle = (index: number, articleId: string) => {
    if (articleId === "manual") {
      // Reset to manual entry
      updateProposalLine(index, 'article_id', null);
      updateProposalLine(index, 'description', '');
      updateProposalLine(index, 'unit', 'un');
      updateProposalLine(index, 'unit_price', 0);
      updateProposalLine(index, 'cost_price', 0);
      updateProposalLine(index, 'margin_euro', 0);
      updateProposalLine(index, 'margin_percentage', 0);
      return;
    }

    const article = articles.find(a => a.id === articleId);
    if (article) {
      updateProposalLine(index, 'article_id', articleId);
      updateProposalLine(index, 'description', article.description);
      updateProposalLine(index, 'unit', article.unit);
      updateProposalLine(index, 'unit_price', article.sale_price);
      updateProposalLine(index, 'cost_price', article.purchase_price);
      
      // Calculate margin from existing prices
      const marginEuro = article.sale_price - article.purchase_price;
      const marginPercent = article.purchase_price > 0 ? (marginEuro / article.purchase_price) * 100 : 0;
      updateProposalLine(index, 'margin_euro', marginEuro);
      updateProposalLine(index, 'margin_percentage', marginPercent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!proposalForm.number || !proposalForm.client_id) {
      toast({
        title: "Erro",
        description: "Número da proposta e cliente são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    proposalMutation.mutate(proposalForm);
  };

  const statusColors = {
    rascunho: "bg-gray-100 text-gray-800",
    enviada: "bg-blue-100 text-blue-800",
    aprovada: "bg-green-100 text-green-800",
    rejeitada: "bg-red-100 text-red-800",
    expirada: "bg-orange-100 text-orange-800"
  };

  const statusLabels = {
    rascunho: "Rascunho",
    enviada: "Enviada",
    aprovada: "Aprovada",
    rejeitada: "Rejeitada",
    expirada: "Expirada"
  };

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{editingProposal ? "Editar Proposta" : "Nova Proposta"}</span>
            <Button variant="outline" onClick={resetForm}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cabeçalho da Proposta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="number">Número da Proposta *</Label>
                <Input
                  id="number"
                  value={proposalForm.number}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="P2024-001"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={proposalForm.client_id || ""}
                  onValueChange={(value) => setProposalForm(prev => ({ ...prev, client_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={proposalForm.status}
                  onValueChange={(value: any) => setProposalForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="enviada">Enviada</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    <SelectItem value="expirada">Expirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="group">Grupo</Label>
                <Select
                  value={proposalForm.group_name || ""}
                  onValueChange={(value) => setProposalForm(prev => ({ ...prev, group_name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Obras Públicas">Obras Públicas</SelectItem>
                    <SelectItem value="Obras Privadas">Obras Privadas</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Consultoria">Consultoria</SelectItem>
                    <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="proposal_date">Data da Proposta</Label>
                <Input
                  id="proposal_date"
                  type="date"
                  value={proposalForm.proposal_date}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, proposal_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="expiry_date">Data de Validade</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={proposalForm.expiry_date || ""}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
            </div>

            {/* Linhas de Artigos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Artigos</h3>
                <Button type="button" onClick={addProposalLine} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Linha
                </Button>
              </div>

              {proposalLines.length > 0 && (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Artigo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Unid.</TableHead>
                        <TableHead>Qtd.</TableHead>
                        <TableHead>Modo Cálculo</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Preço Custo</TableHead>
                        <TableHead>Margem %</TableHead>
                        <TableHead>Margem €</TableHead>
                        <TableHead>Desc. %</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposalLines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={line.article_id || "manual"}
                              onValueChange={(value) => selectArticle(index, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Manual" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manual">Manual</SelectItem>
                                {articles.map((article) => (
                                  <SelectItem key={article.id} value={article.id}>
                                    {article.reference}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={line.description}
                              onChange={(e) => updateProposalLine(index, 'description', e.target.value)}
                              placeholder="Descrição"
                              className="w-40"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={line.unit}
                              onChange={(e) => updateProposalLine(index, 'unit', e.target.value)}
                              className="w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.001"
                              value={line.quantity}
                              onChange={(e) => updateProposalLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={line.calculation_mode}
                              onValueChange={(value: 'pvp' | 'cost') => updateProposalLine(index, 'calculation_mode', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pvp">PVP</SelectItem>
                                <SelectItem value="cost">Custo</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.unit_price}
                              onChange={(e) => updateProposalLine(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-24"
                              readOnly={line.calculation_mode === 'cost'}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.cost_price}
                              onChange={(e) => updateProposalLine(index, 'cost_price', parseFloat(e.target.value) || 0)}
                              className="w-24"
                              readOnly={line.calculation_mode === 'pvp'}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.margin_percentage}
                              onChange={(e) => updateProposalLine(index, 'margin_percentage', parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.margin_euro}
                              onChange={(e) => updateProposalLine(index, 'margin_euro', parseFloat(e.target.value) || 0)}
                              className="w-20"
                              readOnly={line.calculation_mode === 'pvp'}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.discount_percentage}
                              onChange={(e) => updateProposalLine(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            €{line.line_total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProposalLine(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Totais e Observações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={proposalForm.notes || ""}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações adicionais..."
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>€{proposalForm.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="discount">Desconto %:</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    value={proposalForm.discount_percentage}
                    onChange={(e) => {
                      const discount = parseFloat(e.target.value) || 0;
                      setProposalForm(prev => ({ ...prev, discount_percentage: discount }));
                      calculateTotals(proposalLines);
                    }}
                    className="w-24"
                  />
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>€{proposalForm.total.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="commission">Comissão %:</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    value={proposalForm.commission_percentage}
                    onChange={(e) => setProposalForm(prev => ({ ...prev, commission_percentage: parseFloat(e.target.value) || 0 }))}
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={proposalMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {proposalMutation.isPending ? "A guardar..." : "Guardar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Gestão de Propostas
            </CardTitle>
            <CardDescription>
              Gerir propostas comerciais e orçamentos
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">A carregar propostas...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-medium">{proposal.number}</TableCell>
                  <TableCell>{proposal.client?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[proposal.status]}>
                      {statusLabels[proposal.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{proposal.group_name || 'N/A'}</TableCell>
                  <TableCell>{new Date(proposal.proposal_date).toLocaleDateString('pt-PT')}</TableCell>
                  <TableCell>€{proposal.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingProposal(proposal);
                          setProposalForm(proposal);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalManagement;
