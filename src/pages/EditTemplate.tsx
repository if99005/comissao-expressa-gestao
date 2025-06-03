
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Upload, GripVertical, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { supabase } from "@/integrations/supabase/client";

interface TemplatePage {
  id: string;
  title: string;
  orientation: "horizontal" | "vertical";
  backgroundImage?: string;
}

const EditTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [templateName, setTemplateName] = useState("");
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [previewPage, setPreviewPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading template:', error);
        toast.error("Erro ao carregar template");
        navigate("/");
        return;
      }

      setTemplateName(data.name);
      // Safely handle the Json type
      const pagesData = Array.isArray(data.pages) 
        ? (data.pages as unknown as TemplatePage[])
        : [];
      setPages(pagesData);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao carregar template");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const addNewPage = () => {
    let pageTitle = "Página 1";
    
    // Se for a primeira página, criar automaticamente como "Corpo"
    if (pages.length === 0) {
      pageTitle = "Corpo";
    } else {
      // Para as outras páginas, numerá-las sequencialmente
      const pageNumber = pages.length; // Será Página 1, Página 2, etc.
      pageTitle = `Página ${pageNumber}`;
    }

    const newPage: TemplatePage = {
      id: Date.now().toString(),
      title: pageTitle,
      orientation: "vertical"
    };
    setPages(prev => [...prev, newPage]);
  };

  const updatePage = (pageId: string, field: keyof TemplatePage, value: string) => {
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, [field]: value } : page
    ));
  };

  const deletePage = (pageId: string) => {
    setPages(prev => prev.filter(page => page.id !== pageId));
  };

  const handleImageUpload = (pageId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updatePage(pageId, 'backgroundImage', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPages(items);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Por favor, insira o nome do template");
      return;
    }

    if (pages.length === 0) {
      toast.error("Por favor, adicione pelo menos uma página");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('templates')
        .update({
          name: templateName,
          pages: pages as any // Cast to any to handle Json type
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating template:', error);
        toast.error("Erro ao atualizar template");
        return;
      }

      toast.success("Template atualizado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao atualizar template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div>Carregando template...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Templates
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            Editar Template
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Name */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Informações do Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="templateName">Nome do Template *</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Nome do template"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pages Section */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Páginas do Template</CardTitle>
                    <CardDescription>
                      A primeira página será automaticamente chamada "Corpo" onde serão impressos os dados da proposta
                    </CardDescription>
                  </div>
                  <Button onClick={addNewPage} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Página
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="pages">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {pages.map((page, index) => (
                          <Draggable key={page.id} draggableId={page.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border rounded-lg p-4 bg-gray-50"
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-move text-gray-400 hover:text-gray-600"
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                  
                                  <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Título da Página</Label>
                                      <Input
                                        value={page.title}
                                        onChange={(e) => updatePage(page.id, 'title', e.target.value)}
                                        placeholder="Título da página"
                                      />
                                      {index === 0 && (
                                        <p className="text-xs text-blue-600 mt-1">
                                          Esta é a página principal onde serão impressos os dados da proposta
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <Label>Orientação</Label>
                                      <Select
                                        value={page.orientation}
                                        onValueChange={(value) => updatePage(page.id, 'orientation', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="horizontal">Horizontal</SelectItem>
                                          <SelectItem value="vertical">Vertical</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(page.id, e)}
                                      className="hidden"
                                      id={`upload-${page.id}`}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => document.getElementById(`upload-${page.id}`)?.click()}
                                    >
                                      <Upload className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setPreviewPage(previewPage === page.id ? null : page.id)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => deletePage(page.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Image Preview */}
                                {previewPage === page.id && page.backgroundImage && (
                                  <div className="mt-4 p-4 border-t">
                                    <Label className="block mb-2">Pré-visualização:</Label>
                                    <div className={`relative border rounded-lg overflow-hidden ${
                                      page.orientation === 'horizontal' ? 'aspect-[4/3]' : 'aspect-[3/4]'
                                    } max-w-md`}>
                                      <img
                                        src={page.backgroundImage}
                                        alt={`Background para ${page.title}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                                        <span className="text-white font-semibold bg-black bg-opacity-50 px-3 py-1 rounded">
                                          {page.title}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {pages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma página adicionada ainda. Clique em "Adicionar Página" para começar.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Resumo do Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nome</Label>
                    <p className="font-medium">{templateName || "Nome não definido"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Total de Páginas</Label>
                    <p className="font-medium">{pages.length}</p>
                  </div>
                  {pages.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Páginas</Label>
                      <div className="space-y-1">
                        {pages.map((page, index) => (
                          <div key={page.id} className="text-sm">
                            {index + 1}. {page.title} ({page.orientation})
                            {page.backgroundImage && (
                              <span className="text-green-600 ml-2">✓ Com imagem</span>
                            )}
                            {index === 0 && (
                              <span className="text-blue-600 ml-2">• Página principal</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleSave} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTemplate;
