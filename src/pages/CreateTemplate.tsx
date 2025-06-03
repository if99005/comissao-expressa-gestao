
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, GripVertical, X, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface TemplatePage {
  id: string;
  title: string;
  orientation: "horizontal" | "vertical";
  backgroundImage?: string;
}

const CreateTemplate = () => {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState<string>("proposal");
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [saving, setSaving] = useState(false);

  const addPage = () => {
    const pageCount = pages.length;
    const newPage: TemplatePage = {
      id: crypto.randomUUID(),
      title: pageCount === 0 ? "Corpo" : `Página ${pageCount}`,
      orientation: "vertical",
    };
    setPages([...pages, newPage]);
  };

  const removePage = (pageId: string) => {
    setPages(pages.filter(page => page.id !== pageId));
  };

  const updatePage = (pageId: string, updates: Partial<TemplatePage>) => {
    setPages(pages.map(page => 
      page.id === pageId ? { ...page, ...updates } : page
    ));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedPages = Array.from(pages);
    const [removed] = reorderedPages.splice(result.source.index, 1);
    reorderedPages.splice(result.destination.index, 0, removed);

    setPages(reorderedPages);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Nome do template é obrigatório");
      return;
    }

    if (pages.length === 0) {
      toast.error("Adicione pelo menos uma página");
      return;
    }

    setSaving(true);
    
    try {
      console.log('Saving template with data:', {
        name: templateName,
        type: templateType,
        pages: pages
      });

      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: templateName,
          type: templateType,
          pages: pages
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving template:', error);
        toast.error("Erro ao guardar template: " + error.message);
        return;
      }

      console.log('Template saved successfully:', data);
      toast.success("Template criado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao guardar template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Criar Novo Template
              </CardTitle>
              <CardDescription>
                Configure as páginas e layout do seu template
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "A guardar..." : "Guardar Template"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Nome do Template</Label>
              <Input
                id="templateName"
                placeholder="Ex: Template Proposta Padrão"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateType">Tipo</Label>
              <Select value={templateType} onValueChange={setTemplateType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposal">Proposta</SelectItem>
                  <SelectItem value="invoice">Fatura</SelectItem>
                  <SelectItem value="quote">Orçamento</SelectItem>
                  <SelectItem value="report">Relatório</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Páginas do Template</h3>
              <Button onClick={addPage} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Página
              </Button>
            </div>

            {pages.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Nenhuma página adicionada ainda</p>
                <Button onClick={addPage} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeira Página
                </Button>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="pages">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {pages.map((page, index) => (
                        <Draggable key={page.id} draggableId={page.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="border rounded-lg p-4 bg-white"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Label>Título da Página</Label>
                                    <Input
                                      value={page.title}
                                      onChange={(e) => updatePage(page.id, { title: e.target.value })}
                                      placeholder="Nome da página"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label>Orientação</Label>
                                    <Select
                                      value={page.orientation}
                                      onValueChange={(value: "horizontal" | "vertical") => 
                                        updatePage(page.id, { orientation: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="vertical">Vertical</SelectItem>
                                        <SelectItem value="horizontal">Horizontal</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="flex items-end">
                                    <Badge variant="outline">
                                      {page.orientation === "vertical" ? "A4 Vertical" : "A4 Horizontal"}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removePage(page.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTemplate;
