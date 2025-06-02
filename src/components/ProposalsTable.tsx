
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit } from "lucide-react";
import { Proposal, statusColors, statusLabels } from "@/types/proposal";

interface ProposalsTableProps {
  proposals: Proposal[];
  onEdit: (proposal: Proposal) => void;
  isLoading: boolean;
}

export const ProposalsTable = ({ proposals, onEdit, isLoading }: ProposalsTableProps) => {
  if (isLoading) {
    return <div className="text-center py-8">A carregar propostas...</div>;
  }

  return (
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
                  onClick={() => onEdit(proposal)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
