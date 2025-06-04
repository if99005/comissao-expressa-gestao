import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Proposal, ProposalLine, Client } from "@/types/proposal";
import { useProposalMutation } from "@/hooks/useProposalData";
import { useTemplates } from "@/hooks/useTemplates";
import { ProposalLinesTable } from "./ProposalLinesTable";
import { calculateLineTotals } from "@/utils/proposalCalculations";

interface ProposalFormProps {
  editingProposal: Proposal | null;
  onCancel: () => void;
  clients: Client[];
}

export const ProposalForm = ({ editingProposal, onCancel, clients }: ProposalFormProps) => {
  const [proposalForm, setProposalForm] = useState<Proposal>(
    editingProposal || {
      number: '',
      proposal_date: new Date().toISOString().split('T')[0],
      subtotal: 0,
      discount_percentage: 0,
      discount_amount: 0,
      total: 0,
      commission_percentage: 0,
      commission_amount: 0
    }
  );
  const [proposalLines, setProposalLines] = useState<ProposalLine[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    editingProposal?.template_id || ""
  );
  
  const { toast } = useToast();
  const proposalMutation = useProposalMutation();
  const { data: templates = [], isLoading: templatesLoading, error: templatesError } = useTemplates();

  console.log('ProposalForm rendered', { 
    templates, 
    templatesLoading, 
    templatesError,
    selectedTemplate,
    editingProposal: editingProposal?.template_id 
  });

  // Atualizar o template_id no form quando o template selecionado mudar
  useEffect(() => {
    setProposalForm(prev => ({ 
      ...prev, 
      template_id: selectedTemplate || undefined 
    }));
  }, [selectedTemplate]);

  const calculateTotals = (lines: ProposalLine[]) => {
    const { subtotal, total } = calculateLineTotals(lines, proposalForm.discount_percentage);
    const discountAmount = subtotal * (proposalForm.discount_percentage / 100);
    const commissionAmount = total * (proposalForm.commission_percentage / 100);
    setProposalForm(prev => ({ 
      ...prev, 
      subtotal, 
      total, 
      discount_amount: discountAmount,
      commission_amount: commissionAmount
    }));
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

    if (!selectedTemplate) {
      toast({
        title: "Erro",
        description: "A seleção do template é obrigatória",
        variant: "destructive",
      });
      return;
    }

    proposalMutation.mutate({
      proposal: proposalForm,
      proposalLines,
      editingProposal
    }, {
      onSuccess: () => {
        onCancel();
      }
    });
  };

  if (templatesError) {
    console.error('Templates error:', templatesError);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{editingProposal ? "Editar Proposta" : "Nova Proposta"}</span>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cabeçalho da Proposta */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label htmlFor="template">Template *</Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                disabled={templatesLoading}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={templatesLoading ? "A carregar..." : "Selecionar template"} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!templatesLoading && templates.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Nenhum template disponível. Crie um template primeiro.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <ProposalLinesTable 
            proposalLines={proposalLines}
            setProposalLines={setProposalLines}
            onTotalsChange={calculateTotals}
          />

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
                  onChange={(e) => {
                    const commission = parseFloat(e.target.value) || 0;
                    setProposalForm(prev => ({ ...prev, commission_percentage: commission }));
                    calculateTotals(proposalLines);
                  }}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
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
};
