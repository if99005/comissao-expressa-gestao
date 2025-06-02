
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  pages: TemplatePage[];
  createdAt: string;
}

interface TemplatePage {
  id: string;
  title: string;
  orientation: "horizontal" | "vertical";
  backgroundImage?: string;
}

const TemplateManagement = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Proposta Comercial",
      pages: [
        { id: "1", title: "Página Principal", orientation: "vertical" }
      ],
      createdAt: new Date().toISOString()
    }
  ]);

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success("Template eliminado com sucesso!");
  };

  const handleCreateNew = () => {
    navigate("/templates/create");
  };

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
                      {template.pages.length} {template.pages.length === 1 ? 'página' : 'páginas'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(template.createdAt).toLocaleDateString('pt-PT')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateManagement;
