
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      console.log('Fetching templates...');
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Templates fetch error:', error);
        throw error;
      }
      
      console.log('Templates fetched:', data);
      return data || [];
    },
    retry: 1,
    retryDelay: 1000,
  });
};
