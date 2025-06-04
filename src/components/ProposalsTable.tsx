
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, FileDown } from "lucide-react";
import { Proposal } from "@/types/proposal";
import { useToast } from "@/hooks/use-toast";

interface ProposalsTableProps {
  proposals: Proposal[];
  onEdit: (proposal: Proposal) => void;
  isLoading: boolean;
}

export const ProposalsTable = ({ proposals, onEdit, isLoading }: ProposalsTableProps) => {
  const { toast } = useToast();

  const handleGeneratePDF = async (proposal: Proposal) => {
    if (!proposal.template_id) {
      toast({
        title: "Erro",
        description: "Esta proposta não tem um template associado",
        variant: "destructive",
      });
      return;
    }

    try {
      // Aqui será implementada a lógica para gerar o PDF
      toast({
        title: "PDF em geração",
        description: `A gerar PDF da proposta ${proposal.number}...`,
      });
      
      // TODO: Implementar a geração real do PDF com o template
      console.log('Generating PDF for proposal:', proposal.number, 'with template:', proposal.template_id);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF da proposta",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">A carregar propostas...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Grupo</TableHead>
          <TableHead>Template</TableHead>
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
            <TableCell>{proposal.group_name || 'N/A'}</TableCell>
            <TableCell>
              {proposal.template ? (
                <Badge variant="outline">{proposal.template.name}</Badge>
              ) : (
                <span className="text-muted-foreground">Sem template</span>
              )}
            </TableCell>
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
                  onClick={() => onEdit(proposal)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleGeneratePDF(proposal)}
                  disabled={!proposal.template_id}
                  title={!proposal.template_id ? "Sem template associado" : "Gerar PDF"}
                >
                  <FileDown className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
