
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, FileText, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TemplatePage {
  id: string;
  title: string;
  orientation: "horizontal" | "vertical";
  backgroundImage?: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
  pages: TemplatePage[];
  created_at: string;
}

const TemplateManagement = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        toast.error("Erro ao carregar templates");
        return;
      }

      // Convert the Json type to TemplatePage[]
      const formattedTemplates = (data || []).map(template => ({
        ...template,
        pages: Array.isArray(template.pages) ? template.pages as TemplatePage[] : []
      }));

      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting template:', error);
        toast.error("Erro ao eliminar template");
        return;
      }

      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success("Template eliminado com sucesso!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao eliminar template");
    }
  };

  const handleCreateNew = () => {
    navigate("/templates/create");
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div>A carregar templates...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Templates
              </CardTitle>
              <CardDescription>
                Lista de todos os templates de impressão
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum template encontrado. Clique em "Novo Template" para criar o primeiro.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Páginas</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="font-medium">{template.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {template.pages?.length || 0} {(template.pages?.length || 0) === 1 ? 'página' : 'páginas'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(template.created_at).toLocaleDateString('pt-PT')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/templates/${template.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
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
        </CardContent>
      </Card>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pré-visualização: {previewTemplate.name}</CardTitle>
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previewTemplate.pages.map((page, index) => (
                <div key={page.id} className="border rounded-lg p-4">
                  <div className="mb-2">
                    <Badge variant="secondary">{page.title}</Badge>
                    <span className="ml-2 text-sm text-gray-500">
                      ({page.orientation})
                    </span>
                  </div>
                  {page.backgroundImage ? (
                    <div className={`relative border rounded overflow-hidden ${
                      page.orientation === 'horizontal' ? 'aspect-[4/3]' : 'aspect-[3/4]'
                    }`}>
                      <img
                        src={page.backgroundImage}
                        alt={`Página ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <span className="text-white font-semibold bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                          {page.title}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={`border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 ${
                      page.orientation === 'horizontal' ? 'aspect-[4/3]' : 'aspect-[3/4]'
                    }`}>
                      <div className="text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">{page.title}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateManagement;
