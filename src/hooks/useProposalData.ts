
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Proposal, ProposalLine } from "@/types/proposal";

export const useProposals = () => {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          client:clients(id, name, email, phone, nif, address),
          template:templates(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useClients = () => {
  return useQuery({
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
};

export const useArticles = () => {
  return useQuery({
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
};

export const useProposalMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposal, proposalLines, editingProposal }: {
      proposal: Proposal;
      proposalLines: ProposalLine[];
      editingProposal: Proposal | null;
    }) => {
      let savedProposal;
      
      if (editingProposal) {
        const { data, error } = await supabase
          .from('proposals')
          .update(proposal)
          .eq('id', editingProposal.id)
          .select()
          .single();
        if (error) throw error;
        savedProposal = data;
      } else {
        const { data, error } = await supabase
          .from('proposals')
          .insert(proposal)
          .select()
          .single();
        if (error) throw error;
        savedProposal = data;
      }

      // Save proposal lines
      if (proposalLines.length > 0) {
        // Delete existing lines if editing
        if (editingProposal) {
          await supabase
            .from('proposal_lines')
            .delete()
            .eq('proposal_id', savedProposal.id);
        }

        // Insert new lines
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

      return savedProposal;
    },
    onSuccess: (_, { editingProposal }) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast({
        title: "Sucesso",
        description: editingProposal ? "Proposta atualizada!" : "Proposta criada!",
      });
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
};
