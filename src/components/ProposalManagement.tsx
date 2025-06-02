
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Proposal } from "@/types/proposal";
import { useProposals, useClients } from "@/hooks/useProposalData";
import { ProposalForm } from "./ProposalForm";
import { ProposalsTable } from "./ProposalsTable";

const ProposalManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);

  const { data: proposals = [], isLoading } = useProposals();
  const { data: clients = [] } = useClients();

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProposal(null);
  };

  if (showForm) {
    return (
      <ProposalForm
        editingProposal={editingProposal}
        onCancel={handleCancel}
        clients={clients}
      />
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
        <ProposalsTable
          proposals={proposals}
          onEdit={handleEdit}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default ProposalManagement;
