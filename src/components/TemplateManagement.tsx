
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, FileText, Upload, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  orientation: "horizontal" | "vertical";
  backgroundImage?: string;
  fields: TemplateField[];
  createdAt: string;
}

interface TemplateField {
  id: string;
  name: string;
  type: "text" | "number" | "date";
  x: number;
  y: number;
  width: number;
  height: number;
}

const TemplateManagement = () => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Proposta Comercial",
      orientation: "vertical",
      fields: [],
      createdAt: new Date().toISOString()
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    orientation: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      orientation: ""
    });
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.orientation) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    const templateData: Template = {
      id: editingTemplate?.id || Date.now().toString(),
      name: formData.name,
      orientation: formData.orientation as "horizontal" | "vertical",
      fields: editingTemplate?.fields || [],
      createdAt: editingTemplate?.createdAt || new Date().toISOString()
    };

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? templateData : t));
      toast.success("Template atualizado com sucesso!");
    } else {
      setTemplates(prev => [...prev, templateData]);
      toast.success("Template criado com sucesso!");
    }

    resetForm();
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      orientation: template.orientation
    });
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success("Template eliminado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Gestão de Templates
              </CardTitle>
              <CardDescription>
                Criar e gerir templates de impressão para propostas
              </CardDescription>
            </div>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                {editingTemplate ? "Editar Template" : "Novo Template"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Template *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nome do template"
                  />
                </div>
                <div>
                  <Label htmlFor="orientation">Orientação *</Label>
                  <Select value={formData.orientation} onValueChange={(value) => handleInputChange("orientation", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar orientação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
                  {editingTemplate ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Orientação</TableHead>
                <TableHead>Campos</TableHead>
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
                    <Badge className={template.orientation === "horizontal" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                      {template.orientation === "horizontal" ? "Horizontal" : "Vertical"}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.fields.length} campos</TableCell>
                  <TableCell>
                    {new Date(template.createdAt).toLocaleDateString('pt-PT')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
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
